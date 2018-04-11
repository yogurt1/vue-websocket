const COMMENTS_FIXTURE = [
  'Тестовый коммент',
  'Это шедевр',
  'Это прекрасно',
  'Лучше, что я видел',
  'Два чая этому автору',
]

const createGenId = () => {
  let id = 1
  return () => {
    const lastId = id
    id += 1
    return lastId
  }
}

const createDb = () => {
  const genId = createGenId()
  const comments = COMMENTS_FIXTURE.map(comment => ({
    id: genId(),
    text: comment
  }))

  const getComments = () => comments
  const deleteComment = id => {
    const index = comments.findIndex(comment => comment.id === id)
    const has = index > -1;
    has && comments.splice(index, 1)
    return has
  }

  return {
    getComments,
    deleteComment
  }
}

module.exports = createDb
