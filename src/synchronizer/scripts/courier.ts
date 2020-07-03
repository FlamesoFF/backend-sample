import axios from 'axios';
import { CouchDbService } from '../../services/couchDb';
import { isRelationDefined } from '../../shared/utils/typeGuards';
import { MangoQuery } from 'nano';
import { FinancialDocument } from '../../@types/data/document';
import { Relation } from '../../@types/types';


const migrateInvoice = async (setting, invoiceNumber) => {
    const url = setting.defaults.endpoints['m2c-invoice'];
    return await axios.post(url, {
        number: invoiceNumber
    });
};

const getInvoice = async (invoiceNumber) => {
    const query: MangoQuery = {
        selector: {
            $and: [
                {
                    class: 'invoice'
                },
                {
                    number: invoiceNumber
                }
            ]
        }
    };

    const mongoResponse = await CouchDbService.adapter.find(query);

    if (mongoResponse.docs && mongoResponse.docs.length) {
        return mongoResponse.docs[0];
    }
    return null;
};

const processInvoices = async (courier, setting) => {
    if (courier.invoices) {

        for (const i of courier.invoices.map(i => i.value)) {

            const relations: Relation[] = [
                {
                    type: 'issued_to',
                    node: {
                        _id: courier.client.doc_id,
                        class: courier.client.fields && courier.client.fields.class ? courier.client.fields.class : 'company',
                        name: courier.client.value
                    }
                },
                // {
                //     type: 'has_courier',
                //     number: courier.number,
                //     node: {
                //         _id: courier._id,
                //         class: 'courier',
                //         name: courier
                //     }
                // }
            ];

            let issuedByRelation = null;

            if (courier.sender && courier.sender.doc_id && courier.sender.value) {
                issuedByRelation = {
                    type: 'issued_by',
                    node: {
                        _id: courier.sender.doc_id,
                        class: 'company',
                        name: courier.sender.value
                    }
                };
            } else {
                issuedByRelation = {
                    type: 'issued_by',
                    node: setting.defaults.sender
                };
            }
            relations.push(issuedByRelation);

            let invoice = await getInvoice(i);

            if (invoice) {
                if (invoice.relations) {
                    relations.forEach((relation: Relation) => {
                        const exists =
                            invoice.relations.some((invoiceRelation: Relation) =>
                                relation.type === invoiceRelation.type &&
                                (
                                    isRelationDefined(relation) && isRelationDefined(invoiceRelation)
                                )
                            );

                        if (!exists) {
                            invoice.relations.push(relation);
                        }
                    });
                } else {
                    invoice.relations = relations;
                    await CouchDbService.adapter.insert(invoice);
                }
            } else {
                const result = await migrateInvoice(setting, i);

                if (result?.data?.['m2c-invoice']) {
                    const { id } = result.data['m2c-invoice'];

                    invoice = await CouchDbService.adapter.get(id);
                    // invoice.relations.push(hasCourierRelation);

                    await CouchDbService.adapter.insert(invoice);
                }
            }
        }
    }
};

const processOrders = async (oldCourier, newCourier) => {
    let relation = null;
    if (oldCourier.orders) {
        for (const order of oldCourier.orders) {
            for (const company of order.companies) {
                for (const document of company.documents) {
                    relation = {
                        type: 'has_document',
                        node: {
                            class: 'document',
                            name: document.document.value
                        },
                        qty: document.qty
                    };

                    const isRelationsCorrect = newCourier.relations.some(r => {
                        return r.type === 'has_document' && r.node.name === relation.node.name && r.qty === relation.qty;
                    });

                    if (!isRelationsCorrect) {
                        const document: FinancialDocument = {
                            entered_by: undefined,
                            entity: undefined,
                            party: '',
                            schema_id: 'document_v3',
                            type: [''],
                            class: 'document',
                            number: relation.node.name,
                            relations: [{
                                type: 'related_to',
                                node: {
                                    _id: company.company.doc_id,
                                    class: 'company',
                                    name: company.company.value
                                }
                            }]
                        };

                        const result = await CouchDbService.adapter.insert(document);

                        relation.node._id = result.id;
                        newCourier.relations.push(relation);
                    }
                }
            }
        }
    }
};

const mergeRelations = async (oldCourier, newCourier, setting) => {
    let relation = null;

    if (oldCourier.receiver) {
        relation = {
            type: 'has_receiver',
            node: {
                name: oldCourier.receiver.name,
            },
            address: oldCourier.receiver.address,
            contact_name: oldCourier.receiver.name
        };

        if (oldCourier.receiver.country) {
            //@ts-ignore
            relation.country = oldCourier.receiver.country.fields.code;
        }

        if (oldCourier.receiver.structured_address) {
            //@ts-ignore
            relation.structured_address = oldCourier.receiver.structured_address;

            if (oldCourier.receiver.structured_address.phone) {
                //@ts-ignore
                relation.phone = oldCourier.receiver.structured_address.phone;
            }
        }

        if (!newCourier.relations.some(r => {
            return r.type === 'has_receiver' && r.contact_name === relation.contact_name;
        })) {
            newCourier.relations.push(relation);
        }
    }

    if (oldCourier.manager) {
        relation = {
            type: 'managed_by',
            node: {
                _id: oldCourier.manager.doc_id,
                class: 'person',
                name: oldCourier.manager.value
            }
        };
        if (oldCourier.manager.fields) {
            if (oldCourier.manager.fields.initial) {
                //@ts-ignore
                relation.initials = oldCourier.manager.fields.initial;
            }
            if (oldCourier.manager.fields.emails) {
                //@ts-ignore
                relation.emails = oldCourier.manager.fields.emails.map(e => e.address);
            }
        }
        if (!newCourier.relations.some(r => {
            return r.type === 'managed_by' && r.node._id === relation.node._id;
        })) {
            newCourier.relations.push(relation);
        }
    }

    if (oldCourier.sender) {
        if (oldCourier.sender.value) {
            relation = {
                type: 'has_sender',
                node: {
                    _id: oldCourier.sender.doc_id,
                    name: oldCourier.sender.value,
                    class: 'company'
                },
                sender_name: oldCourier.sender.value
            };
        } else {
            relation = {
                type: 'has_sender',
                //@ts-ignore
                node: setting.defaults.sender,
                //@ts-ignore
                sender_name: setting.defaults.sender.name
            };
        }
    } else {
        relation = {
            type: 'has_sender',
            node: setting.defaults.sender,
            sender_name: setting.defaults.sender.name
        };
    }
    if (!newCourier.relations.find(r => {
        return r.type === 'has_sender' && r.node._id === relation.node._id;
    })) {
        newCourier.relations.push(relation);
    }
    await processOrders(oldCourier, newCourier);
};

const processCourier = async (oldCourier, setting) => {
    let newCourier = null;
    try {
        newCourier = await CouchDbService.adapter.get(oldCourier._id);
    } catch (error) {
        if (error.reason !== 'missing' && error.reason !== 'deleted') {
            throw error;
        }
    }
    if (!newCourier) {
        newCourier = {
            _id: oldCourier._id,
            class: 'courier',
            name: oldCourier.name,
            contents: oldCourier.contents,
            number: oldCourier.number,
            relations: []
        };
    }
    try {
        await mergeRelations(oldCourier, newCourier, setting);
    } catch (error) {
        console.error(error);
    }


    await CouchDbService.adapter.insert(newCourier);

    await processInvoices(oldCourier, setting);
};

const script = {
    apply: async (change, setting) => {
        const isDeleted = change.deleted;
        const courier = change.doc;
        console.log(courier._id);

        if (isDeleted) {
            //handle delete
        } else {
            await processCourier(courier, setting);
        }
    }
};

module.exports = script;