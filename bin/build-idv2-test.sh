#!/usr/bin/env bash

echo " ==== creating zip ----";


BASE_DIR='/C/opt/work/idv0'

echo " ==== base dir: $BASE_DIR/idv2  ----";
cd $BASE_DIR;


DST_FILE='\\wifishare01.dsec\wifishare\Censos2016Apk\idv2\idv2.zip'


if [ -f $DST_FILE ] ; then
    echo " ==== delete old idv2.zip ----";
    rm $DST_FILE
fi


echo " ==== create idv2.zip ----";
jar -cMf ${DST_FILE} ./idv2

#copy to test also
TEST_DST_FILE='\\wifishare01.dsec\wifishare\apk\idv2\files.zip'
cp $DST_FILE $TEST_DST_FILE



#mv cpi.zip  ${DST_FILE}

echo " ==== done ----";

echo " ==== prd file: $DST_FILE";
echo " ==== tst file: $TEST_DST_FILE";





