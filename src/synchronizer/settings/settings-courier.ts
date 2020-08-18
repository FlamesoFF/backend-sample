const settings = {
    processors: [
        {
            enable: false,
            name: 'receivers',
            condition: (change) => change.doc && change.doc.class && change.doc.receivers,
            script: './scripts/receiver.ts'
        },
        {
            enable: true,
            name: 'couriers',
            condition: (change) => change.doc && change.doc.class && change.doc.class === 'document' && (change.doc.type && change.doc.type.includes('courier')),
            script: './scripts/courier.ts',
            defaults: {
                sender: {
                    _id: 'xxx-ltd',
                    class: 'company',
                    name: 'XXX LTD'
                },
                endpoints:{
                    'm2c-invoice': 'http://localhost:3066/processors/execute?type=m2c-invoice'
                }
            }
        }
    ]
};

export default settings;