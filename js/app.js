$(function() {
  var $game = $(".real-guitar-hero"),
      $restartButton = $(".js-restart"),
      $bpmInput = $game.find(".game-settings__bpm-input"),
      $songSelect = $game.find(".game-settings__song-select"),
      $stringSelect = $game.find(".game-settings__string-select"),
      $score = $game.find(".score__points"),
      $settings = $game.find(".game-settings"),
      $toggleSettings = $game.find(".js-toggle-settings");

  var $welcomePopup = $(".welcome-popup"),
      $startButton = $welcomePopup.find(".welcome-popup__start-button");


  // song loader
  var songLoader = new SongLoader();

  // fps options
  var fpsInterval = 1000 / gameConfig.fps,
      startTime,
      now,
      then,
      elapsed;

  //canvas variables
  var canvas = document.getElementById("game-canvas");
  var canvasPadding = 0;

  var ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth - canvasPadding;
  ctx.canvas.height = window.innerHeight - canvasPadding;

  var explosion = new ExplosionEffect(ctx);

  // game variables
  var continueAnimating = false;
  var score = 0;

  // block variables
  var pegWidth = 1;

  // rock variables
  var rockWidth = canvas.width / 12;
  var rockFontSize = 0.5 * rockWidth;
  var rockSpeed;
  var rockHeight = rockWidth;
  var eightsDurationDistance = rockHeight;
  var rocks = [];

  var fretboard = new Fretboard(canvas, songLoader, rockWidth, pegWidth);

  function initRocks(songIndex) {
    rocks = [];
    var song = songLoader.songs[songIndex];
    var totalRocks = song.length;

    for (var i = 0; i < totalRocks; i++) {
      addRock(i, song);
    }
  }

  function calculateRockY(rockIndex) {
    var prevRock = rockIndex === 0 ? rocks[rocks.length - 1] : rocks[rockIndex - 1];
    var minRockY = rocks.length === 0 ? 0 : Math.min.apply(Math, rocks.map(function(r){return r.y;}));

    return rocks.length === 0 ? 0 : minRockY - prevRock.durationDistance;
  }

  function addRock(rockIndex, song) {
    var rock = {
      width: rockWidth - pegWidth,
      height: rockHeight,
      durationDistance: eightsDurationDistance * 8 / song[rockIndex][1]
    }

    var prevRock = rockIndex === 0 ? rocks[rocks.length - 1] : rocks[rockIndex - 1];

    rock.note = song[rockIndex][0];

    var noteIndex = songLoader.findNoteIndex(rock.note);

    rock.x = noteIndex * rockWidth + pegWidth;
    rock.y = calculateRockY(rockIndex);

    rocks.push(rock);
  }

  function animate() {
    if(continueAnimating) {
      requestAnimationFrame(animate);
    } else {
      return;
    }

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);

      // Drawing code
      for (var i = 0; i < rocks.length; i++) {
        var rock = rocks[i];

        rock.y += rockSpeed;

        if (rock.y > canvas.height) {
          if(!rock.highlightColor) {
            score -= 10;
          }

          explosion.add(rock.x + rock.width / 2, canvas.height - 5, !!rock.highlightColor);

          rock.y = calculateRockY(i);
          rock.highlightColor = undefined;
        }
      }

      drawAll();
    }
  }

  function isColliding(rock) {
    return rock.y > canvas.height - rockHeight;
  }

  function drawAll() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.fillStyle = gameConfig.colors.dark_blue;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fretboard.draw();

    // draw all rocks
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];

      if(rock.y + rock.height > 0) {
        ctx.font = "bold " + rockFontSize + "px Source Sans Pro, sans-serif";

        var lineWidth = 8;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = rock.highlightColor ? rock.highlightColor : gameConfig.colors.white;
        ctx.textAlign="center";
        ctx.textBaseline = "middle";

        var textString = rock.note,
            textWidth = ctx.measureText(textString).width;

        ctx.beginPath();
        ctx.arc(rock.x + rockWidth / 2 - pegWidth / 2, rock.y + rockHeight / 2, rock.width / 2 - lineWidth / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = gameConfig.colors.dark_blue;
        ctx.fill();

        ctx.fillStyle = gameConfig.colors.white;
        ctx.fillText(textString, rock.x + rockWidth / 2, rock.y + rockHeight / 2);
      }

      ctx.lineWidth = 1;
    }

    $score.text(score);

    explosion.draw();
  }

  songLoader.populateSelectMenu($songSelect);

  var processor = new AudioProcessor();

  processor.setString($stringSelect.val());
  processor.attached();

  $(document).on("note_detected", function(event, note) {
    var rockIndex = rocks.findIndex(function(r) {
      return r.y >= canvas.height - 2 * rockHeight;
    });

    if(rockIndex === -1) {
      fretboard.highlightFret(note);
      return;
    }

    var rock = rocks[rockIndex];

    if(!isColliding(rock)) {
      fretboard.highlightFret(note);
      return;
    }

    var correctAnswer = note === rock.note;

    fretboard.highlightFret(note, correctAnswer ? gameConfig.colors.green : gameConfig.colors.red);

    if(correctAnswer) {
      score += 10;
    } else {
      score -= 10;
    }

    explosion.add(rock.x, rock.y, correctAnswer);

    rock.highlightColor = correctAnswer ? gameConfig.colors.green : gameConfig.colors.red;
  });

  $restartButton.on("click", function () {
    $settings.removeClass("game-settings--active");
    $welcomePopup.removeClass("welcome-popup--active");

    var beatDuration = 60 / $bpmInput.val();

    rockSpeed = eightsDurationDistance * 8 / (gameConfig.fps * beatDuration);

    var songIndex = $songSelect.val();

    then = Date.now();
    startTime = then;
    continueAnimating = !continueAnimating;

    if(continueAnimating) {
      $startButton.hide();
      initRocks(songIndex);
      processor.setString($stringSelect.val());
    }

    animate();
  });

  $toggleSettings.on("click", function(e) {
    e.preventDefault();

    $settings.toggleClass("game-settings--active");

    continueAnimating = !$settings.hasClass("game-settings--active");
    animate();
  });

  var toggleGame = function() {
    continueAnimating = !continueAnimating;

    if(continueAnimating) {
      $settings.removeClass("game-settings--active");
      $welcomePopup.removeClass("welcome-popup--active");
    }

    animate();
  }

  $(document).on("keydown", function(e) {
    if(e.keyCode === 32) {
      toggleGame();
    }
  });
});
