#!/bin/bash

UNAME=$(uname)
if [ "$UNAME" == "Linux" ] ; then
    sudo service bluetooth stop
    sudo hciconfig hci0 up
fi

DAYOFWEEK=$(date +"%u")
echo DAYOFWEEK: $DAYOFWEEK

if [ "${DAYOFWEEK}" -le 5 ]
then
    ./LILO -t 10,00,22,15

elif [ "${DAYOFWEEK}" -eq 6 ]
then
    ./LILO -t 12,00,23,00

elif [ "${DAYOFWEEK}" -eq 7 ]
then
    ./LILO -t 12,00,23,00
fi
