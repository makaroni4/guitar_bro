// https://github.com/GoogleChrome/guitar-tuner
function AudioProcessor() {
  this.FFTSIZE = 2048 * 4;
  this.stream = null;
  this.audioContext = new AudioContext();
  this.analyser = this.audioContext.createAnalyser();
  this.gainNode = this.audioContext.createGain();
  this.microphone = null;

  this.gainNode.gain.value = 0;
  this.analyser.fftSize = this.FFTSIZE;
  this.analyser.smoothingTimeConstant = 0.1;

  this.frequencyBufferLength = this.FFTSIZE;
  this.frequencyBuffer = new Float32Array(this.frequencyBufferLength / 2);
  this.timeBuffer = new Float32Array(this.frequencyBufferLength);

  this.sendingAudioData = false;

  this.last_wave_power = 0;
  this.wave_power_threshold = 0.006;
  this.last_note_time = -1;

  var that = this;

  this.requestUserMedia = function () {
    navigator.getUserMedia({audio:true}, (stream) => {
      that.sendingAudioData = true;
      that.stream = stream;
      that.microphone = that.audioContext.createMediaStreamSource(stream);
      that.microphone.connect(that.analyser);
      that.analyser.connect(that.gainNode);
      that.gainNode.connect(that.audioContext.destination);

      requestAnimationFrame(that.dispatchAudioData);

    }, (err) => {
      console.log('Unable to access the microphone');
      console.log(err);
    });
  }

  this.attached = function() {
    // Set up the stream kill / setup code for visibility changes.
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Then call it.
    this.onVisibilityChange();
  }

  this.detached = function() {
    this.sendingAudioData = false;
  }

  this.onVisibilityChange = function() {
    if (document.hidden) {
      this.sendingAudioData = false;

      if (this.stream) {
        // Chrome 47+
        this.stream.getAudioTracks().forEach((track) => {
          if ('stop' in track) {
            track.stop();
          }
        });

        // Chrome 46-
        if ('stop' in this.stream) {
          this.stream.stop();
        }
      }

      this.stream = null;
    } else {
      this.requestUserMedia();
    }

  }

  /**
   * Autocorrelate the audio data, which is basically where you
   * compare the audio buffer to itself, offsetting by one each
   * time, up to the half way point. You sum the differences and
   * you see how small the difference comes out.
   */

  var log = 10000;

  this.find_note_freq = function(time) {
    let wave_power = 0;
    let wave_power_min = 0.008;
    let assessedStringsInLastFrame = that.assessedStringsInLastFrame;

    let freq_step = that.audioContext.sampleRate / this.FFTSIZE;
    let min_freq_ind = Math.round(300 / freq_step);
    let max_freq_ind = Math.round(700 / freq_step);

    // console.log(freq_step, min_freq_ind, max_freq_ind)

    // Fill up the data.

    that.analyser.getFloatTimeDomainData(that.timeBuffer);
    that.analyser.getFloatFrequencyData(that.frequencyBuffer);
    freq = that.frequencyBuffer;
    wave = that.timeBuffer;

    for (let d = 0; d < wave.length; d++) {
      wave_power += wave[d] * wave[d];
    }
    wave_power = Math.sqrt(wave_power / wave.length);

    // median = d3.median(freq);

    for (let d = 0; d < freq.length; d++) {
      // if (freq[d] < median){
      //   freq[d] = median;
      // }
      freq[d] = Math.pow(10, freq[d] / 20);
      freq[d] *= freq[d] * 100000;
    }


    let max_A = -1000000;
    let arg_max = -1;
    for (let i = min_freq_ind; i < max_freq_ind; i++) {
      if (freq[i] > max_A){
        max_A = freq[i];
        arg_max = i;
      }
    }

    let total_energy = 0;
    for (let i = min_freq_ind; i < max_freq_ind; i++) {
      total_energy += freq[i];
    }

    let maximum_energy = 0;
    for (let i = Math.round(arg_max - 20 / freq_step - 1); i <= Math.round(arg_max + 20 / freq_step + 1); i++){
      maximum_energy += freq[i];
    }

    if (maximum_energy / total_energy < 0.96){
      return -1;
    }

    if (time > this.last_note_time + 100){
      this.last_wave_power = 0;
    }

    if (wave_power < this.last_wave_power){
      return -1;
    }

    this.last_note_time = time;
    this.last_wave_power = wave_power;

    freq_x = [];
    for (let i = min_freq_ind; i < max_freq_ind; i++){
      freq_x.push(i * freq_step);
    }

    // plot_data([{y: Array.from(freq.slice(min_freq_ind, max_freq_ind)), x: freq_x, type: 'scatter'}] );
    return arg_max * freq_step;
  }

  this.dispatchAudioData = function(time) {

    let freqs = [
      [329.6, "E"],
      [349.2, "F"],
      [370.0, "F#"],
      [392.0, "G"],
      [415.3, "G#"],
      [440.0, "A"],
      [466.1, "A#"],
      [493.8, "B"],
      [523.2, "C"],
      [554.3, "C#"],
      [587.3, "D"],
      [622.2, "D#"],
      [659.2, "E"],
    ];

    // plot_lines(freqs);


    // Always set up the next pass here, because we could
    // early return from this pass if there's not a lot
    // of exciting data to deal with.
    if (that.sendingAudioData) {
      requestAnimationFrame(that.dispatchAudioData);
    }

    let frequency = that.find_note_freq(time);
    if (frequency < 0){
      return;
    }

    let min_freq_error = 10000;
    let best_chord_ind = 0;
    for (let i = 0; i < freqs.length; i++){
      let chord_freq = freqs[i][0];
      let chord = freqs[i][1];

      //let n_div = frequency / chord_freq;   //for future
      let n_div = 1;
      let error = Math.abs( Math.round(n_div) * chord_freq - frequency);
      if (error < min_freq_error){
        best_chord_ind = i;
        min_freq_error = error;
      }
    }

    if (min_freq_error < 20){
      $(document).trigger("note_detected", [freqs[best_chord_ind], frequency, min_freq_error]);
    }

  }
}

$(function() {
  var processor = new AudioProcessor();
  processor.attached();
})
