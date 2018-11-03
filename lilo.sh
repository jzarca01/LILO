#!/bin/bash

sudo service bluetooth stop
sudo hciconfig hci0 up

DAYOFWEEK=$(date +"%u")
echo DAYOFWEEK: $DAYOFWEEK

if [ "${DAYOFWEEK}" -eq 5 ]
then
    ./LILO -t 09,00,23,59

elif [ "${DAYOFWEEK}" -eq 6 ]
then
    ./LILO -t 12,00,23,59

elif [ "${DAYOFWEEK}" -eq 7 ]
then
    ./LILO -t 12,00,23,00

else
    ./LILO
fi