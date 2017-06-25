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

    "Abba: Money Money Money v2 (Tempo=200)": [['F', 4], ['G', 8], ['G#', 4], ['F', 8], ['G', 4], ['G#', 4], ['-', 4], ['G#', 4], ['F', 8], ['G', 4], ['G#', 4], ['-', 4], ['G', 4], ['F', 8], ['G#', 4], ['G#', 4], ['-', 16], ['F', 1]],

    "Coca Cola(Tempo=125)": [['A', 8], ['A', 8], ['A', 8], ['A', 8], ['A#', 4], ['A', 8], ['G', 4], ['G', 8], ['C', 8], ['A', 4], ['F', 4], ['-', 2]],

    "Eiffel 65: Blue v1 (Tempo=140)": [['A', 4], ['A#', 4], ['G', 8], ['A#', 8], ['C', 8], ['F', 8], ['A', 8], ['A#', 4], ['G', 8], ['A#', 8], ['D', 8], ['D#', 4], ['D', 8], ['C', 8], ['A#', 4], ['G', 8], ['A#', 8], ['C', 8], ['F', 8], ['A', 8], ['A#', 4], ['G', 8], ['A#', 8], ['D', 8], ['D#', 4], ['D', 8], ['C', 8], ['A#', 4], ['G', 8], ['A#', 8], ['C', 8], ['F', 8], ['A', 8], ['A#', 4], ['G', 8], ['A#', 8], ['D', 8], ['D#', 4], ['D', 8], ['C', 8], ['A#', 4], ['G', 8], ['A#', 8], ['A', 8], ['F', 8], ['F', 8], ['G', 2]],

    "Europe: The Final Countdown (Tempo=125)": [['-', 4], ['-', 8], ['C', 16], ['A#', 16], ['C', 4], ['F', 4], ['-', 4], ['-', 8], ['C#', 16], ['C', 16], ['C#', 8], ['C', 8], ['A#', 4], ['-', 4], ['-', 8], ['C#', 16], ['C', 16], ['C#', 4], ['F', 4], ['-', 4], ['-', 8], ['A#', 16], ['G#', 16], ['A#', 8], ['G#', 8], ['G', 8], ['A#', 8], ['G#', 4], ['-', 8], ['G', 16], ['G#', 16], ['A#', 4], ['-', 8], ['G#', 16], ['A#', 16], ['C', 8], ['A#', 8], ['G#', 8], ['G', 8], ['F', 4], ['C#', 4], ['C', 2], ['-', 4], ['C', 16], ['C#', 16], ['C', 16], ['A#', 16], ['C', 1]],

    "Haddaway: What is Love (Tempo=225)": [['A#', 4], ['A', 4], ['A#', 4], ['G', 4], ['A#', 4], ['A', 4], ['A#', 4], ['G', 4], ['A#', 4], ['A', 4], ['A#', 4], ['F', 4], ['A#', 4], ['A', 4], ['A#', 4], ['F', 4], ['A', 4], ['G', 4], ['A', 4], ['F', 4], ['A', 4], ['G', 4], ['A', 4], ['F', 4], ['A', 4], ['G', 4], ['A', 4], ['F', 4], ['A', 4], ['G', 4], ['A', 4], ['F', 4]],


    "James Bond: Tomorrow Never Dies (Tempo=125)": [['F', 8], ['G', 16], ['G', 16], ['G', 8], ['G', 4], ['F', 8], ['F', 8], ['F', 8], ['F', 8], ['G#', 16], ['G#', 16], ['G#', 8], ['G#', 4], ['G', 8], ['G', 8], ['G', 8], ['F', 8], ['G', 16], ['G', 16], ['G', 8], ['G', 4], ['F', 8], ['F', 8], ['F', 8], ['F', 8], ['G#', 16], ['G#', 16], ['G#', 8], ['G#', 4], ['G', 8], ['G', 8], ['G', 8]],


    "Nirvana: Come as You Are (Tempo=225)": [['F', 8], ['F', 8], ['F#', 8], ['G', 8], ['-', 4], ['-', 4], ['A#', 8], ['G', 8], ['A#', 8], ['G', 8], ['G', 8], ['F#', 8], ['F', 8], ['C', 8], ['F', 8], ['F', 8], ['-', 4], ['-', 4], ['C', 8], ['F', 8], ['F#', 8], ['G', 8], ['-', 4], ['-', 4], ['A#', 8], ['G', 8], ['A#', 8], ['G', 8], ['G', 8], ['F#', 8], ['F', 8], ['C', 8], ['F', 8], ['F', 8], ['-', 4], ['-', 4], ['C', 8]],


    "Ricky Martin: Livin La Vida Loca (Tempo=160)": [['A#', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 16], ['-', 32], ['F#', 8], ['G#', 8], ['B', 16], ['-', 8], ['-', 16], ['B', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 4], ['-', 8], ['A#', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 16], ['-', 32], ['F#', 8], ['F', 8], ['G#', 8], ['-', 8], ['G#', 8], ['-', 8], ['F#', 4], ['-', 4], ['-', 8], ['A#', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 8], ['F#', 8], ['G#', 8], ['B', 16], ['-', 8], ['-', 16], ['B', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 4], ['-', 8], ['A#', 16], ['-', 8], ['-', 16], ['A#', 4], ['-', 8], ['F#', 8], ['F', 8], ['G#', 16], ['-', 8], ['-', 16], ['G#', 8], ['-', 8], ['F#', 4], ['-', 8]],

    "Smoke on the Water (Tempo=112)": [['F', 4], ['G#', 4], ['A#', 4], ['F', 4], ['G#', 4], ['B', 8], ['A#', 4], ['-', 4], ['F', 4], ['G#', 4], ['A#', 4], ['G#', 4], ['F', 4], ['-', 2], ['-', 8], ['F', 4], ['G#', 4], ['A#', 4], ['F', 4], ['G#', 4], ['B', 8], ['A#', 4], ['-', 4], ['F', 4], ['G#', 4], ['A#', 4], ['G#', 4], ['F', 4], ['-', 4]]
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
      if (encodedSong.constructor === Array){
        return encodedSong;
      }
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
