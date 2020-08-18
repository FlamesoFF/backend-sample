import { CouchDbService } from '../../services/couchDb';
import { Relation } from "../../@types/types";

/*
 * {url, database} = helper.getConfig().couchdb.apollo,
 * nano = require('nano')(url);
 */


const updateRelation = async (targetEntity, receiver) => {
    const relation: Relation = {
        type: 'has_receiver',
        node: {
            name: receiver.name,
        },
        contact_name: receiver.name,
        address: receiver.address
    };

    if (receiver.country) {
        relation.country = receiver.country.fields.code;
    }
    if (receiver.structured_address) {
        relation.structured_address = receiver.structured_address;
        if (receiver.structured_address.phone) {
            relation.contact_phone = receiver.structured_address.phone;
        }
    }
    if (targetEntity.relations) {
        if (!targetEntity.relations.find(r => r.type === 'has_receiver' && r.name === relation.name)) {
            targetEntity.relations.push(relation);
        }
    } else {
        targetEntity.relations = [relation];
    }
};

export const apply = async (change, setting) => {
    const isDeleted = change.deleted;
    const entity = change.doc;
    const targetEntity = await CouchDbService.adapter.get(entity._id);

    if (targetEntity) {
        if (isDeleted) {
            let save = false;

            if (targetEntity.relations) {
                entity.receivers.forEach(r => {
                    const findIndex = targetEntity.relations.findIndex(re => r.type === 'has_receiver' && re.name === r.name);

                    if (findIndex) {
                        targetEntity.relations.splice(findIndex, 1);
                        save = true;
                    }
                });
                if (save) {
                    await CouchDbService.adapter.insert(targetEntity);
                }
            }
        } else {
            entity.receivers.forEach(r => {
                updateRelation(targetEntity, r);
            });
            await CouchDbService.adapter.insert(targetEntity);
        }
    }
};

export const initialize = async (setting, documents) => {
};
// module.exports = script;