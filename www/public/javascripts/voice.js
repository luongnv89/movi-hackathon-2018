function text2speech( text, callbackOnEnd ){
   var msg = new SpeechSynthesisUtterance();
   var voices = window.speechSynthesis.getVoices();
   msg.voice = voices[10]; // Note: some voices don't support altering params
   msg.voiceURI = 'native';
   msg.volume = 1; // 0 to 1
   msg.rate = 1; // 0.1 to 10
   msg.pitch = 2; //0 to 2
   msg.text = text;
   msg.lang = 'en-US';
   msg.onend = callbackOnEnd;

   speechSynthesis.speak(msg);
}


const recognition = new webkitSpeechRecognition();
//recognition.continuous = true;
//recognition.interimResults = true;

function speech2text( callbackOnEnd ){
   recognition.onresult = function(event) { 
      console.log(event);
      var text = "";
      for(var i=0; i<event.results.length; i++){
         text += event.results[i][0].transcript;
      }
      if( callbackOnEnd )
         callbackOnEnd( text ); 
   }
   recognition.start();
}