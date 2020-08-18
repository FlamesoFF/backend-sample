const settings = {
    processors: [{
        enable: true,
        name: 'shred',
        condition: (change) => change.doc && (change.doc.type && change.doc.type.includes('todo') && change.doc.type.includes('shred') && change.doc.authority == 'BVI'),
        script: './scripts/shredder-vg.ts',
        defaults: {
            payloads: [{
                enable: true,
                condition: (todo) => todo.completed && todo.tags && todo.tags.includes('check-file-content') && !(todo.comments || []).some(c => c.body.trim().toLowerCase().includes('not found')),
                body: {
                    type: ['todo', 'shred'],
                    content: 'Check file content',
                    creator_guid: 'm.sereda',
                    assigned_by_guid: 'm.sereda',
                    responsible_guid: 'm.sereda',
                    responsible_group: {
                        doc_id: null,
                        value: ""
                    },
                    start_task: false,
                    tags: ['shred-file']
                }
            }, {
                enable: true,
                condition: (todo) => todo.completed && todo.tags && todo.tags.includes('shred-file') && !todo.comments,
                body: {
                    type: ['todo', 'shred'],
                    content: 'Shred file',
                    creator_guid: 'm.sereda',
                    assigned_by_guid: 'm.sereda',
                    responsible_guid: 'm.sereda',
                    responsible_group: {
                        doc_id: null,
                        value: ""
                    },
                    tags: ['cm-approved'],
                    start_task: false
                }
            }, {
                enable: true,
                condition: (todo) => todo.completed && todo.tags && todo.tags.includes('shred-file') && (todo.comments || []).some(c => c.body.trim().toLowerCase().includes('to assess')),
                body: {
                    type: ['todo', 'shred'],
                    content: 'Move to CD',
                    creator_guid: 'm.sereda',
                    assigned_by_guid: 'm.sereda',
                    responsible: {
                        fields: {
                            code: ''
                        },
                        doc_id: null,
                        value: ''
                    },
                    responsible_group: '803a79e0c17ac7a354a4f3701a9b8024',
                    tags: ['cd-assess-file'],
                    start_task: false
                }
            },
                {
                    enable: true,
                    condition: (todo) => todo.completed && todo.tags && todo.tags.includes('cd-assess-file'),
                    body: {
                        type: ['todo', 'shred'],
                        content: 'Assess Company File',
                        creator_guid: 'm.sereda',
                        assigned_by_guid: 'm.sereda',
                        responsible: {
                            fields: {
                                code: ''
                            },
                            doc_id: null,
                            value: ''
                        },
                        responsible_group: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        tags: ['ca-move-cm'],
                        start_task: false
                    }
                },
                {
                    enable: true,
                    condition: (todo) => todo.completed && todo.tags && todo.tags.includes('ca-move-cm') && !(todo.comments || []).some(c => c.body.trim().toLowerCase().includes('shredding approved')),
                    body: {
                        type: ['todo', 'shred'],
                        content: 'File to FC',
                        creator_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        assigned_by_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        responsible: {
                            fields: {
                                code: ''
                            },
                            doc_id: null,
                            value: ''
                        },
                        responsible_group: '803a79e0c17ac7a354a4f3701a9b8024',
                        start_task: false
                    }
                },
                {
                    enable: true,
                    condition: (todo) => todo.completed && todo.tags && todo.tags.includes('ca-move-cm') && (todo.comments || []).some(c => c.body.trim().toLowerCase().includes('shredding approved')),
                    body: {
                        type: ['todo', 'shred'],
                        content: 'Move to CM',
                        creator_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        assigned_by_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        responsible: {
                            fields: {
                                code: ''
                            },
                            doc_id: null,
                            value: ''
                        },
                        responsible_group: '803a79e0c17ac7a354a4f3701a9b8024',
                        tags: ['shred-file-cd-approved'],
                        start_task: false
                    }
                },
                {
                    enable: true,
                    condition: (todo) => todo.completed && todo.tags && todo.tags.includes('shred-file-cd-approved'),
                    body: {
                        type: ['todo', 'shred'],
                        content: 'Shred file',
                        creator_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        assigned_by_guid: 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
                        responsible_guid: 'm.sereda',
                        responsible_group: {
                            doc_id: null,
                            value: ""
                        },
                        tags: ['cd-approved'],
                        start_task: false
                    }
                }]
        }
    }]
};

export default settings;