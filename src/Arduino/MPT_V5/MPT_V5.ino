/*Messages sent to computer:

  message sent to computer if the button was pressed by visitor

          {"message":"vrs-button-press", "value":1}


  squeeze count message example for 2 squeezes 

          {"message":"squeeze-count", "value":2}


  analog serial stream, returns value 0-1023

         {"message":"pressure-reading", "value":520}

*/

//Arduino I/O pins

#define button 2


//other variables

 long timenow = 0;
 int count = 0;
 bool newread = true;
 int val = 0;
 int timerDuration = 5000; //5 second timer


void setup() {
  pinMode(button, INPUT_PULLUP);
  Serial.begin(115200);
  val = analogRead(0);
  delay(2);
}

void listendata() {
  while (millis() < timenow + timerDuration) { //5 second timer
    val = analogRead(0);
    delay(2);

    if ((val > 200) && (newread)) {
      newread = false;
      count = count + 1;
    }
    if (val < 190) {
      newread = true;
    }
  }
}

void loop() {
  if (!button) {
    timenow = millis();
    Serial.println("{\"message\":\"vrs-button-press\", \"value\":1}");
    listendata();
  }

  switch (count) {

    case 2:
      Serial.println("{\"message\":\"material\", \"value\":\"limestone\"}");
      count = 0;
      break;

    case 3:
      Serial.println("{\"message\":\"material\", \"value\":\"dolomite\"}");
      count = 0;
      break;

    case 4:
      Serial.println("{\"message\":\"material\", \"value\":\"shale\"}");
      count = 0;
      break;

    case 5:
      Serial.println("{\"message\":\"material\", \"value\":\"sandstone\"}");
      count = 0;
      break;
  }

  //analog serial stream

  Serial.print("{\"message\":\"pressure-reading\", \"value\":");
  Serial.print(val);
  Serial.println("}");
}


