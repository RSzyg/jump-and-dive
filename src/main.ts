import { Application, Point } from 'pixi.js'
import { sharedUserInput } from './useUserInput'
import { Role } from './role'
import { World } from './world'

import levelInfo from './levels/one'

(async () => {
  // Create a new application
  const app = new Application()
  await app.init({ background: '#96cf85', width: 720, height: 720 })
  document.getElementById('container')!.appendChild(app.canvas)

  // Register user input
  const { register: registerUserInput } = sharedUserInput
  registerUserInput()

  const world = new World(app, levelInfo)

  // Initialize the role
  const role = new Role(app, world)

  app.ticker.add(() => {
    // Camera follow the role
    const { width, height } = app.renderer
    const roleCenterRelativeView = { x: role.position.x + app.stage.position.x, y: role.position.y + app.stage.position.y }
    const viewCenterPoint = { x: width / 2, y: height / 2 }

    const delta = { x: roleCenterRelativeView.x - viewCenterPoint.x, y: roleCenterRelativeView.y - viewCenterPoint.y }

    app.stage.position.x -= delta.x
    app.stage.position.y -= delta.y
  })

})()
