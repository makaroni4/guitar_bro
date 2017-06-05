// https://stackoverflow.com/questions/43498923/html5-canvas-particle-explosion
function ExplosionEffect(ctx) {
  const particlesPerExplosion = 25;
  const particlesMinSpeed     = 5;
  const particlesMaxSpeed     = 10;
  const particlesMinSize      = 2;
  const particlesMaxSize      = 4;
  var   explosions            = [];

  function particle(x, y, correctAnswer) {
    this.x    = x;
    this.y    = y;
    this.xv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.yv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.size = randInt(particlesMinSize, particlesMaxSize, true);

    if(correctAnswer) {
      this.r    = randInt(78, 98);
      this.g    = 221;
      this.b    = randInt(134, 154);
    } else {
      this.r    = 237;
      this.g    = randInt(27, 47);
      this.b    = randInt(68, 88);
    }
  }

  function explosion(x, y, correctAnswer) {
    this.particles = [];

    for (let i = 0; i < particlesPerExplosion; i++) {
      this.particles.push(
        new particle(x, y, correctAnswer)
      );
    }
  }

  return {
    draw: function() {
      if (explosions.length === 0) {
        return;
      }

      for (let i = 0; i < explosions.length; i++) {

        const explosion = explosions[i];
        const particles = explosion.particles;

        if (particles.length === 0) {
          explosions.splice(i, 1);
          return;
        }

        const particlesAfterRemoval = particles.slice();
        for (let ii = 0; ii < particles.length; ii++) {

          const particle = particles[ii];

          // Check particle size
          // If 0, remove
          if (particle.size <= 0) {
            particlesAfterRemoval.splice(ii, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
          ctx.closePath();
          ctx.fillStyle = 'rgb(' + particle.r + ',' + particle.g + ',' + particle.b + ')';
          ctx.fill();

          // Update
          particle.x += particle.xv;
          particle.y += particle.yv;
          particle.size -= .1;
        }

        explosion.particles = particlesAfterRemoval;
      }
    },
    add: function(x, y, correctAnswer) {
      explosions.push(
        new explosion(x, y, correctAnswer)
      );
    }
  }
}
