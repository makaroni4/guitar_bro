function SongLoader() {
  const randomSongLength = 10;

  Object.keys(gameConfig.strings).forEach(function(string) {
    var rows = gameConfig.strings[string].freqs.slice(1, 13);
    var notes = rows.map(function(row) {
      var note = row[1];

      return note;
    })

    gameConfig.strings[string].notes = notes;
  });

  const songs = {
    "Random notes": randomArray(12, 11).join("----"),
    "Happy Birthday": "0-0-2--0--5-4----0-0-2--0----7-5----0-0-9--7-5-4--2-2----10-10-9--5--7-5",
    "Guess what": "0--3--5---0--3--6--5---0--3--5---3--0",
  }

  function parseSong(encodedSong, string) {
    let song = [];
    let duration = 0;
    let last_note;
    for (let i = 0; i < encodedSong.length; i++){
      if (encodedSong[i] != "-"){
        if (duration > 0){
          song.push([last_note, 8 / duration]);
        }

        let fret = parseInt(encodedSong[i]);
        last_note = fret === 0 ? "E" : gameConfig.strings[string].notes[fret - 1];
        duration = 0;
      } else {
        duration += 1;
      }
    }
    song.push([last_note, 8/8.0]);
    return song;
  }


  return {
    loadSong: function(songIndex, string) {
      var encodedSong = songs[songIndex];

      return parseSong(encodedSong, string);
    },
    findNoteIndex: function(note, string) {
      return gameConfig.strings[string].notes.findIndex(function(n) {
        return note === n;
      });
    },
    populateSelectMenu: function($songSelect) {
      for(song in songs) {
        var $option = $("<option/>");
        $option.val(song);
        $option.text(song);

        if(song === "Random") {
          $option.attr("selected", "selected");
        }

        $songSelect.append($option);
      }
    }
  }
}
