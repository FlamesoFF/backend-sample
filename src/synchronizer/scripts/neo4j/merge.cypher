UNWIND {data} as row
MERGE (n:row.class {_id: row._id, class: row.class}) 
ON CREATE SET n += row.props 
ON MATCH SET n += row.props