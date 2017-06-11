$(function() {
  var $game = $(".real-guitar-hero"),
      $startButton = $game.find(".real-guitar-hero__start-button"),
      $bpmInput = $game.find(".game-settings__bpm-input"),
      $songSelect = $game.find(".game-settings__song-select"),
      $stringSelect = $game.find(".game-settings__string-select"),
      $score = $game.find(".score__points"),
      $settings = $game.find(".game-settings"),
      $toggleSettings = $game.find(".js-toggle-settings");

  // song loader
  var songLoader = new SongLoader();

  // fps options
  var fps = 30,
      fpsInterval = 1000 / fps,
      startTime,
      now,
      then,
      elapsed;

  //canvas variables
  var canvas = document.getElementById("game-canvas");
  var canvasPadding = 200;

  canvas.width = window.innerWidth - canvasPadding;
  canvas.height = window.innerHeight - canvasPadding;

  $game.css("width", window.innerWidth - canvasPadding);
  $game.css("height", window.innerHeight - canvasPadding);

  var ctx = canvas.getContext("2d");
  var explosion = new ExplosionEffect(ctx);

  // game variables
  var continueAnimating = false;
  var score = 0;

  // block variables
  var pegWidth = 2;

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
    if (continueAnimating) {
      requestAnimationFrame(animate);
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
          score -= 10;

          explosion.add(rock.x, canvas.height - 5, false);

          rock.y = calculateRockY(i);
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
    ctx.fillStyle = "ivory";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fretboard.draw();

    // draw all rocks
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];

      if(rock.y + rock.height > 0) {
        ctx.font = rockFontSize + "px Times New Roman";

        var lineWidth = 8;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#FFF";
        ctx.textAlign="center";
        ctx.textBaseline = "middle";

        var textString = rock.note,
            textWidth = ctx.measureText(textString).width;

        ctx.beginPath();
        ctx.arc(rock.x + rockWidth / 2 - pegWidth / 2, rock.y + rockHeight / 2, rock.width / 2 - lineWidth / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#FFA100";
        ctx.fill();

        ctx.fillStyle = "#FFF";
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
    fretboard.highlightFret(note);

    var rockIndex = rocks.findIndex(function(r) {
      return r.y >= canvas.height - 2 * rockHeight;
    });

    if(rockIndex === -1) {
      return;
    }

    var rock = rocks[rockIndex];

    if(!isColliding(rock)) {
      return;
    }

    var correctAnswer = note === rock.note;

    if(correctAnswer) {
      score += 10;
    } else {
      score -= 10;
    }

    explosion.add(rock.x, rock.y, correctAnswer)

    rock.y = calculateRockY(rockIndex);
  });

  $startButton.on("click", function () {
    $settings.removeClass("game-settings--active");

    var beatDuration = 60 / $bpmInput.val();

    rockSpeed = eightsDurationDistance * 8 / (fps * beatDuration);

    var songIndex = $songSelect.val();

    then = Date.now();
    startTime = then;
    continueAnimating = !continueAnimating;

    if(continueAnimating) {
      initRocks(songIndex);
      processor.setString($stringSelect.val());
    }

    $startButton.text($startButton.data(continueAnimating ? "stop" : "start"));

    animate();
  });

  $toggleSettings.on("click", function(e) {
    e.preventDefault();

    $settings.toggleClass("game-settings--active");
  });
});
