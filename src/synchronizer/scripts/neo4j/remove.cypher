UNWIND {data} as id
MATCH (result:node {_id: id})
DETACH DELETE result