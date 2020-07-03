
UNWIND [
    {id: 'one', rel: {type: 'related_to', who: 'two'}},
    {id: 'two', rel: {type: 'related_to', who: 'one'}}
] as row
MATCH (n1:node {_id: row.id})
MATCH (n2:node {_id: row.rel.who})