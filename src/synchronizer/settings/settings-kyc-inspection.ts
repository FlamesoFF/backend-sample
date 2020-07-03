const settings = {
    processors: [{
        enable: true,
        name: '/kyc-inspection',
        condition: (change) => change.doc && (change.doc.type && change.doc.type.includes('todo') && change.doc.type.includes('kyc-inspection')),
        script: './scripts/kyc-inspection.ts'
    }]
};

export default settings;