import sys
import time
from time import sleep
import drivers
import threading
from flask import Flask, request, jsonify


latest_weight = 0


app = Flask(__name__)

@app.route('/weight', methods=['GET'])
def get_weight():
    global latest_weight
    return jsonify({'weight': latest_weight})

def run_flask_server():
    app.run(host='0.0.0.0', port=8500)  # Adjust the host and port as needed


EMULATE_HX711=False

if not EMULATE_HX711:
   import RPi.GPIO as GPIO
   from hx711 import HX711
else:
   from emulated_hx711 import HX711

referenceUnit=1

def cleanAndExit():
   print("Cleaning...")

   if not EMULATE_HX711:
      GPIO.cleanup()

   display.lcd_clear()
   sys.exit()

hx = HX711(5, 6)
hx.set_reading_format("MSB", "MSB")
hx.set_reference_unit(241.05)

hx.reset()
hx.tare()

display = drivers.Lcd()

display.lcd_display_string("Tare Completed!", 1) 
display.lcd_display_string("Place the weight on the scale now...", 2)
sleep(2)

ema_val = 0
alpha = 0.75

flask_server_thread = threading.Thread(target=run_flask_server)
flask_server_thread.start()

while True:
   try:
      raw_val = hx.get_weight(5)
      ema_val = (alpha * raw_val) + ((1 - alpha) * ema_val)
      val_str = "{:.2f}".format(ema_val)
      val_str = val_str.ljust(16)
      display.lcd_clear()
      display.lcd_display_string("The weight is...", 1)
      display.lcd_display_string(val_str, 2)


      hx.power_down()
      hx.power_up()
      time.sleep(0.1)
      
      global latest_weight
      latest_weight = ema_val

   except (KeyboardInterrupt, SystemExit):
      cleanAndExit()

