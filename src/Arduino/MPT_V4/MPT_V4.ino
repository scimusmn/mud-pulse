/*Messages sent to computer:

   message sent to computer if tube is not squeezed in time:

          {"message":"no-squeezes", "value":1}

   message sent to computer if tube squeeze count doesn't match anything:

          {"message":"no-match", "value":1}

   message sent to computer if the button was pressed by visitor

          {"message":"vrs-button-press", "value":1}


   Material maessages:

   2 squeezes :

        {"message":"material", "value":"limestone"}

   3 squeezes :

        {"message":"material", "value":"dolomite"}

   4 squeezes :

        {"message":"material", "value":"shale"}

   5 squeezes :

        {"message":"material", "value":"sandstone"}

Serial stream:

        {"message":"pressure-reading", "value":520}  
 
*/

//Arduino I/O pins

#define button 2


//other variables
long timenow = 0;
int count = 0;
bool newread = true;
int val = 0;



void setup() {
  pinMode(button, INPUT_PULLUP);
  Serial.begin(115200);
  val = analogRead(0);
  delay(2);
}

void listendata() {
  while (millis() < timenow + 4000) {
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
  if (count == 0) {

    Serial.println("{\"message\":\"no-squeezes\", \"value\":1");
  }

  if ((count < 2) || (count > 5)) {
    count = 0;
    Serial.println("{\"message\":\"no-match\", \"value\":1");
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
  
  //Serial stream

  Serial.print("{\"message\":\"pressure-reading\", \"value\":");
  Serial.print(val);
  Serial.println("}");
}


