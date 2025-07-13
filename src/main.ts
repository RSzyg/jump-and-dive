import { Application, Point } from "pixi.js";
import { sharedUserInput } from "./useUserInput";
import { Role } from "./role";
import { initializeGround } from "./ground";

(async () => {
  // Create a new application
  const app = new Application();
  await app.init({ background: "#96cf85", width: 720, height: 720 });
  document.getElementById("container")!.appendChild(app.canvas);

  // Register user input
  const { register: registerUserInput } = sharedUserInput;
  registerUserInput();

  // Initialize the role
  const role = new Role(app, new Point(300, 100));
  const ground = initializeGround(app);

  app.ticker.add(() => {
    // Test role hit ground
    const roleBounds = role.getBounds();
    const groundBounds = ground.getBounds();
    if (
      roleBounds.minX < groundBounds.maxX &&
      roleBounds.maxX > groundBounds.minX &&
      roleBounds.minY < groundBounds.maxY &&
      roleBounds.maxY > groundBounds.minY
    ) {
      console.log('>>> role bound:', role.getBounds());
      console.log('>>> ground bound:', ground.getBounds(), ground.hitArea);
      if (roleBounds.maxY >= groundBounds.minY) {
        console.log('>>> role hit ground', roleBounds.maxY, '>=', groundBounds.minY);
        role.isJumping = false;
        role.velocity.y = 0;
        role.position.y = groundBounds.minY - roleBounds.height / 2;
        console.log('>>> correction role y position:', role.position.y, role.getBounds());
      }
    }
  });
})();
