export function validateBody(body) {
  return body.title && body.description
}

export function validateId(id, db) {
  return db.select('tasks', id).length > 0
}