#!/usr/bin/env python

from .PCA9685 import PWM
import time
import os

DIR = os.path.dirname(os.path.realpath(__file__))

FILE_CONFIG = os.path.join(DIR, "config")

def Map(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

def setup(pwm_in):
    global leftPWM, rightPWM, homePWM, pwm
    leftPWM = 400
    homePWM = 450
    rightPWM = 500
    offset = 0
    try:
        for line in open(FILE_CONFIG):
            if line[0:8] == 'offset =':
                offset = int(line[9:-1])
    except:
        print('config error')
    leftPWM += offset
    homePWM += offset
    rightPWM += offset
    pwm = pwm_in

# ==========================================================================================
# Control the servo connected to channel 0 of the servo control board, so as to make the 
# car turn left.
# ==========================================================================================
def turn_left():
    global leftPWM
    pwm.write(0, 0, leftPWM)  # CH0

# ==========================================================================================
# Make the car turn right.
# ==========================================================================================
def turn_right():
    global rightPWM
    pwm.write(0, 0, rightPWM)

# ==========================================================================================
# Make the car turn back.
# ==========================================================================================

def turn(angle):
    angle = Map(angle, 0, 255, leftPWM, rightPWM)
    pwm.write(0, 0, angle)

def home():
    global homePWM
    pwm.write(0, 0, homePWM)

def calibrate(x):
    pwm.write(0, 0, 450+x)

def test():
    while True:
        turn_left()
        time.sleep(1)
        home()
        time.sleep(1)
        turn_right()
        time.sleep(1)
        home()

if __name__ == '__main__':
    setup()
    home()
