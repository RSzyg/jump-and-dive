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

})()
