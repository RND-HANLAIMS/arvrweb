const app = require('./app')
const models = require('./models')
const PORT = process.env.PORT || 3000

models.sequelize.sync({
  force: true
}).then(async _=> {
  const user = await models.User.create({
    email: 'test@test.com',
    password: '123123',
    //name: '{"fullname":"김창국", "initial":"CK", "email":"Changkuk.kim@hanlaims.com", "color":"indigo", "auth":"admin"}',
    info: '{"fullname":"김창국", "initial":"CK", "email":"Changkuk.kim@hanlaims.com", "color":"indigo", "auth":"admin"}',
  })
  const board = await models.Board.create({
    title: 'Sample Board',
    userId: user.id
  })
}).then(_=> {
  app.listen(PORT, () => console.log(`server is running localhost:${PORT}`))
})

