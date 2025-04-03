addEventListener("click", (event) => {
  const angle = Math.atan2(
    (event.clientY * window.devicePixelRatio) - canvas.height / 2,
    (event.clientX * window.devicePixelRatio) - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * projectileSpeedFactor,
    y: Math.sin(angle) * projectileSpeedFactor,
  };
  frontEndProjectiles.push(
    new Projectile({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 5,
      color: "white",
      velocity,
    })
  );
  console.log(frontEndProjectiles)
});
