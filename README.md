package ng-filter-props
=

Simulate Spotfire filter component,to  implement dynamic filter.



## Installation

```html
<script src="/node_modules/ng-filter-props/filterComonent.js"></script>
```

Or `require('ng-filter-props')` from your code.



## Example
![github](/static/images/filter_main.gif)

HTML
```html

    <ng-filters-props config="filterConfig" data="carrier_info"
               mappingconfig="mappingConfig" columnnumber="4"></ng-filters-props>
```

## Documentation - attribute

###config
mandatory field  and the type is Array,init filter component,

<pre><code>
     $scope.filterConfig=[
           {
                key:'vesselName',//mandatory , match key
                scopeKey:'vesselNamesList',//option ,display List
                allKey:'isAllVesselSelected',//option, Listen weather select All
                orgListName:'storeVesselList',//option ,store the org List
                curMarkIndexName:'vesselMarkIndex',//option ,store mark index of the list(need sort pre)->lister shift key
                curSelectName:'vesselSelectList',//option ,store have marked records
                orderFlag:1,//option ,sort the org List,default +
                inputFilterName:'vesselInputFilter',//option ,init input to filter the results
                filterDisplayLength:'vesselLength',//option ,show the active filter list length
                filterTitle:'Vessel Name',//option ,show the filter title ,default will show key name
            } 
     ]

</code></pre>


###data
mandatory field  and the type is Array,init filter data,
eg:filterKey is every filter record unique key.
other attribute is mapping to the above config key.
<pre><code>
     $scope.carrier_info=[
        {
            'vesselName':"OOCL",
            'filterKey':'oocl'
        },{
            'vesselName':"COSCON",
            'filterKey':'coscon'
        }
     ]

</code></pre>

###mappingconfig

option field  and the type is Object,init filter data,

key:
filterKey:the fitler record unique key,
key: get the final filter result base on the key

<pre><code>
 $scope.mappingConfig={
            key:"vesselName",
            filterKey:"filterKey"
    };
</code></pre>


###callresults
option , base on mappingconfig,and get the final filter result from orginal data.

<pre><code>
$scope.$on('callFilterCompoentResults', function(event, data){
            //console.log('-------------------------------');
            console.log(data);
   })
</code></pre>

###columnnumber

init filter component layout



## License

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
