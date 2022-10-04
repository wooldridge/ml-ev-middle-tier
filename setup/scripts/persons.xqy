xquery=
xquery version "1.0-ml";
import module namespace tde = "http://marklogic.com/xdmp/tde" at "/MarkLogic/tde.xqy";
let $persons :=
<template xmlns="http://marklogic.com/xdmp/tde">
  <context>/person</context>
  <rows>
    <row>
      <schema-name>main</schema-name>
      <view-name>persons</view-name>
      <columns>
        <column>
          <name>ID</name>
          <scalar-type>int</scalar-type>
          <val>person/id</val>
        </column>
        <column>
          <name>FirstName</name>
          <scalar-type>string</scalar-type>
          <val>person/name/first</val>
        </column>
        <column>
          <name>LastName</name>
          <scalar-type>string</scalar-type>
          <val>person/name/last</val>
        </column>
        <column>
          <name>Status</name>
          <scalar-type>string</scalar-type>
          <val>person/status</val>
        </column>
       </columns>
    </row>
  </rows>
</template>
return tde:template-insert("/persons.xml", $persons)
&
vars={}