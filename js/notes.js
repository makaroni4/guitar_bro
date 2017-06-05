$(function() {
  // song loader
  var songLoader = new SongLoader();

  // fps options
  var fps, fpsInterval, startTime, now, then, elapsed;

  //canvas variables
  var canvas = document.getElementById("game-canvas");
  var ctx = canvas.getContext("2d");
  var explosion = new ExplosionEffect(ctx);

  // game variables
  var continueAnimating = false;
  var score = 50;

  // block variables
  var blockWidth = canvas.width;
  var blockHeight = 50;
  var block = {
    x: 0,
    y: canvas.height - blockHeight,
    width: blockWidth,
    height: blockHeight
  }
  var highlightedFret;

  // rock variables
  var pegWidth = 2;
  var rockWidth = 50;
  var rockSpeed;
  var rockHeight = rockWidth;
  var eightsDurationDistance = rockHeight;
  var rocks = [];

  function initRocks(songIndex) {
    var song = songLoader.songs[songIndex];
    var totalRocks = song.length;

    for (var i = 0; i < totalRocks; i++) {
      addRock(i, songIndex);
    }
  }

  function calculateRockY(rockIndex) {
    var prevRock = rockIndex === 0 ? rocks[rocks.length - 1] : rocks[rockIndex - 1];
    var minRockY = rocks.length === 0 ? 0 : Math.min.apply(Math, rocks.map(function(r){return r.y;}));

    return rocks.length === 0 ? 0 : minRockY - prevRock.durationDistance;
  }

  function addRock(rockIndex, songIndex) {
    var song = songLoader.songs[songIndex];
    var rock = {
      width: rockWidth - pegWidth,
      height: rockHeight,
      durationDistance: eightsDurationDistance * 8 / song[rockIndex][1]
    }

    var prevRock = rockIndex === 0 ? rocks[rocks.length - 1] : rocks[rockIndex - 1];

    rock.note = song[rockIndex][0];

    var noteIndex = songLoader.findNoteIndex(rock.note);

    rock.x = noteIndex * rockWidth + pegWidth;

    resetRock(rock, rockIndex);
    rocks.push(rock);
  }

  function resetRock(rock, rockIndex) {
    rock.y = calculateRockY(rockIndex)
  }

  function highlightFret(note) {
    var fretIndex = songLoader.findNoteIndex(note);

    highlightedFret = fretIndex;

    setTimeout(function() {
      highlightedFret = undefined;
    }, 100);
  }

  function drawCircle(x, y) {
    var circleSize = (blockHeight / 6 - 1) / 2;

    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawFretBoard() {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = "lightgray";
    ctx.strokeRect(block.x, block.y, block.width, block.height);

    for(var i = 0; i < songLoader.notes.length; i++) {
      ctx.fillStyle = "#FFF";
      ctx.fillRect(i * rockWidth, block.y, pegWidth, block.height);
    }

    // draw single circles
    var circleFrets = [2, 4, 6, 8];
    var cirlceColor = "#FFF";
    var verticalMiddle = canvas.height - block.height / 2;
    var circleSize = (blockHeight / 6 - 1) / 2;

    circleFrets.forEach(function(fret) {
      drawCircle((rockWidth * fret - 1) + rockWidth / 2 + pegWidth, verticalMiddle);
    });

    // draw double circles
    var doubleCirclesFret = 12;
    drawCircle((rockWidth * 11) + rockWidth / 2 + pegWidth, canvas.height - circleSize * 2.5);
    drawCircle((rockWidth * 11) + rockWidth / 2 + pegWidth, canvas.height - blockHeight + 2.5 * circleSize);

    if(typeof(highlightedFret) === "number") {
      ctx.fillStyle = "#F991CC";
      ctx.fillRect(highlightedFret * rockWidth, block.y, rockWidth - pegWidth, rockHeight);
    }
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

          resetRock(rock, i);
        }
      }

      drawAll();
    }
  }

  function isColliding(a, b) {
    return !(
      b.y > a.y + a.height ||
      b.y + b.height < a.y
    );
  }

  function drawAll() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.fillStyle = "ivory";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the Fretboard block
    drawFretBoard();

    // draw all rocks
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];
      ctx.fillStyle = "#FFA100";
      ctx.fillRect(rock.x, rock.y, rock.width, rock.height);

      ctx.font = "28px Times New Roman";
      ctx.fillStyle = "#FFF";
      ctx.textAlign="center";
      ctx.textBaseline = "middle";
      ctx.fillText(rock.note, rock.x + 25, rock.y + 25);
    }

    $score.text(score);

    explosion.draw();
  }

  var $game = $(".real-guitar-hero"),
      $startButton = $game.find(".start-game"),
      $bpmInput = $game.find(".real-guitar-hero__bpm-input"),
      $songSelect = $game.find(".real-guitar-hero__song-select"),
      $score = $game.find(".real-guitar-hero__score");

  songLoader.populateSelectMenu($songSelect);

  $(document).on("note_detected", function(event, note, freq, error) {
    note = note[1];
    highlightFret(note);

    var rockIndex = rocks.findIndex(function(r) {
      return r.y >= canvas.height - blockHeight - rockHeight;
    });

    if(rockIndex === -1) {
      return;
    }

    var rock = rocks[rockIndex];

    if(!isColliding(block, rock)) {
      return;
    }

    var correctAnswer = note === rock.note;

    if(correctAnswer) {
      score += 10;
    } else {
      score -= 10;
    }

    explosion.add(rock.x, rock.y, correctAnswer)

    var currentY = rock.y;

    resetRock(rock, rockIndex);
  });

  $startButton.on("click", function () {
    var beatDuration = 60 / $bpmInput.val(),
        fps = 30;

    rockSpeed = eightsDurationDistance * 8 / (fps * beatDuration);

    var songIndex = $songSelect.val();

    initRocks(songIndex);

    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    continueAnimating = true;
    animate();
  });
});
