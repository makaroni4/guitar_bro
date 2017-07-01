$(function() {
  var $game = $(".real-guitar-hero"),
      $score = $game.find(".score__points");

  var $settings = $(".game-settings"),
      $bpmInput = $settings.find(".game-settings__bpm-input"),
      $songSelect = $settings.find(".game-settings__song-select"),
      $stringSelect = $settings.find(".game-settings__string-select");

  for(string in gameConfig.strings) {
    var $option = $("<option/>");
    $option.val(string);
    $option.text(gameConfig.strings[string].name);

    if(string === "1") {
      $option.attr("selected", "selected");
    }

    $stringSelect.append($option);
  }

  var $sidebarMenu = $(".sidebar-menu"),
      $startButton = $sidebarMenu.find(".js-start");

  var songIndex, stringIndex, bpm, fretboard;

  // song loader
  var songLoader = new SongLoader();

  // fps options
  var fpsInterval = 1000 / gameConfig.fps,
      startTime,
      now,
      then,
      elapsed;

  var gameIsOn = false;

  //canvas variables
  var canvas = document.getElementById("game-canvas");

  var ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  var explosion = new ExplosionEffect(ctx);

  var healthDrawer = new HealthDrawer(ctx);

  // game variables
  var continueAnimating = false,
      score = 0,
      correctNotes = 0,
      MAX_HEALTH = 5,
      health = MAX_HEALTH;

  // block variables
  var pegWidth = 1;

  // rock variables
  var rockWidth = canvas.width / 12;
  var rockFontSize = 0.5 * rockWidth;
  var rockSpeed;
  var rockHeight = rockWidth;
  var eightsDurationDistance = rockHeight;
  var rocks = [];

  function initRocks(songIndex, string) {
    rocks = [];
    var song = songLoader.loadSong(songIndex, string);
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

    var noteIndex = songLoader.findNoteIndex(rock.note, stringIndex);

    rock.x = noteIndex * rockWidth + pegWidth;
    rock.y = calculateRockY(rockIndex);

    rocks.push(rock);
  }

  function toggleMenuCopy(type) {
    var $header = $sidebarMenu.find(".sidebar-menu__header"),
        $subheader = $sidebarMenu.find(".sidebar-menu__subheader");

    $header.text($header.data(type));
    $subheader.text($subheader.data(type));
  }

  function stopGame() {
    ga("send", {
      hitType: "event",
      eventCategory: "Game",
      eventAction: "Lost",
      eventValue: correctNotes
    });

    toggleSettings();

    $sidebarMenu.addClass("sidebar-menu--active");
    toggleMenuCopy("gameOverCopy");

    $songSelect.val(songIndex);
    $stringSelect.val(stringIndex);
    $bpmInput.val(bpm);

    gameIsOn = false;
  }

  function animate() {
    if(health === 0 && !continueAnimating) {
      clearBackground();
    }

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
          if(rock.highlightColor) {
            explosion.add(rock.x + rock.width / 2, canvas.height - 5, rock.highlightColor === gameConfig.colors.green);
          } else {
            decrementScore();
          }

          rock.y = calculateRockY(i);
          rock.highlightColor = undefined;

          if(health === 0) {
            stopGame();
          }
        }
      }

      drawAll();
    }
  }

  function isColliding(rock) {
    return rock.y > canvas.height - rockHeight;
  }

  function decrementScore() {
    score -= 10;
    health -= 1;
  }

  function clearBackground() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.fillStyle = gameConfig.colors.dark_blue;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawAll() {
    clearBackground();

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

    healthDrawer.draw(health);

    $score.text(score);

    explosion.draw();
  }

  songLoader.populateSelectMenu($songSelect);

  songIndex = $songSelect.val();
  stringIndex = $stringSelect.val();
  bpm = $bpmInput.val();

  if(getChromeVersion() > 57) {
    var processor = new AudioProcessor();

    processor.setString(stringIndex);
    processor.attached();

    $(".allow-mic").addClass("allow-mic--active");
  } else if(getChromeVersion() < 58) {
    $(".sidebar-menu__update-chrome").addClass("sidebar-menu__update-chrome--active");
  } else {
    $(".sidebar-menu__install-chrome").addClass("sidebar-menu__install-chrome--active");

    showNoMic();
  }

  function showNoMic() {
    $(".no-sound").addClass("no-sound--active");
    $(".audio-wave").removeClass("audio-wave--active");
  }

  $(document).on("no_mic", function() {
    showNoMic();
  });

  $(document).on("note_detected", function(event, note) {
    if(!gameIsOn) {
      return;
    }

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

    if(rock.highlightColor) {
      return;
    }

    var correctAnswer = note === rock.note;

    fretboard.highlightFret(note, correctAnswer ? gameConfig.colors.green : gameConfig.colors.red);

    if(correctAnswer) {
      score += 10;
      correctNotes += 1;

      if(health < MAX_HEALTH) {
        health += 1;
      }
    } else {
      decrementScore();
    }

    explosion.add(rock.x, rock.y, correctAnswer);

    rock.highlightColor = correctAnswer ? gameConfig.colors.green : gameConfig.colors.red;
  });

  $startButton.on("click", function () {
    ga("send", "event", "Game", "Start");

    fretboard = new Fretboard(canvas, songLoader, stringIndex, rockWidth, pegWidth);

    toggleMenuCopy("welcomeCopy");
    $(".allow-mic").removeClass("allow-mic--active");
    $sidebarMenu.removeClass("sidebar-menu--active");

    correctNotes = 0;

    var beatDuration = 60 / bpm;

    rockSpeed = eightsDurationDistance * 8 / (gameConfig.fps * beatDuration);

    then = Date.now();
    startTime = then;
    continueAnimating = !continueAnimating;

    if(continueAnimating) {
      gameIsOn = true;
      score = 0;
      health = MAX_HEALTH;
      initRocks(songIndex, stringIndex);

      if(getChromeVersion()) {
        processor.setString(stringIndex);
      }
    }

    animate();
  });

  var toggleSettings = function(params) {
    $sidebarMenu.toggleClass("sidebar-menu--active");

    continueAnimating = !$sidebarMenu.hasClass("sidebar-menu--active");

    gameIsOn = continueAnimating;

    animate();
  }

  $songSelect.on("change", function(e) {
    songIndex = $(this).val();
  });

  $stringSelect.on("change", function(e) {
    stringIndex = $(this).val();
  });

  $bpmInput.on("change", function(e) {
    bpm = $(this).val();
  });

  $(document).on("keydown", function(e) {
    if(e.keyCode === 32 && elapsed) {
      toggleSettings();
    }
  });
});
