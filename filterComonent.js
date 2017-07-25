var angular = require('angular');
var _ = require('lodash');
angular.module('ngFiltersProperties', []).directive('ngFiltersProps', ['$filter','$compile',function ($filter,$compile) {
    return{
        restrict: 'EA',
        //template: '<div ng-bind-html="compoentHtml"></div>',
        scope:{
            config:"=",
            data:"=",
            columnnumber:"=",
            mappingconfig:"=",
            callresults:"&"
        },
        replace: true,
        link:function (scope, element, attrs) {
            var OP = Object.prototype;
            var isEmpty=function(key){
                   return (typeof key=='undefined' || key==null);
            }
            var initFilterComponent=function(carrier_info,filterConfig){
                scope.filterComponentOrgDataList=carrier_info;
                scope.filterComponentConfig=filterConfig;
                var invalidKeyFlag=false;
                var keyMapping={};
                filterConfig.forEach(function(curConfig){
                    if(isEmpty(curConfig.key)){
                        invalidKeyFlag=true;
                        console.error('invalid filter config: missing filter key!!');
                        return false;
                    }
                    curConfig.scopeKey=(isEmpty(curConfig.scopeKey)?curConfig.key+'List':curConfig.scopeKey);
                    scope[curConfig.scopeKey]=[];

                    curConfig.allKey=(isEmpty(curConfig.allKey)?'isAll'+curConfig.key+'Selected':curConfig.allKey);
                    curConfig.filterDisplayLength=(isEmpty(curConfig.filterDisplayLength)?curConfig.key+'Length':curConfig.filterDisplayLength);

                    curConfig.curSelectName=(isEmpty(curConfig.curSelectName)?curConfig.key+'SelectList':curConfig.curSelectName);
                    curConfig.curMarkIndexName=(isEmpty(curConfig.curMarkIndexName)?curConfig.key+'MarkIndex':curConfig.curMarkIndexName);
                    curConfig.inputFilterName=(isEmpty(curConfig.inputFilterName)?curConfig.key+'InputFilter':curConfig.inputFilterName);
                    curConfig.filterTitle=(isEmpty(curConfig.filterTitle)?curConfig.key:curConfig.filterTitle);
                });
                if(!invalidKeyFlag){
                    carrier_info.forEach(function(curItem){
                        filterConfig.forEach(function(curConfig){
                            if(scope[curConfig.scopeKey]==null){
                                scope[curConfig.scopeKey]=[];
                            }
                            let curValue=curItem[curConfig.key];
                            if( typeof curValue != 'undefined'){
                                curValue=_.isEmpty(curValue)?'(Empty)':curValue;
                                var checkValue={};
                                checkValue[curConfig.key]=curValue;
                                if( _.isEmpty(_.find(scope[curConfig.scopeKey], checkValue))){
                                    var newValue={};
                                    newValue[curConfig.key]=curValue;
                                    newValue.isSelected=false;
                                    newValue.isDisplay=true;
                                    scope[curConfig.scopeKey].push(newValue);
                                }
                            }
                        });
                    });
                    filterConfig.forEach(function(curConfig){
                        curConfig.orderFlag=(isEmpty(curConfig.orderFlag)?1:curConfig.orderFlag);
                        var reverseFlag=((curConfig.orderFlag==1)?'+':'-');
                        scope[curConfig.scopeKey]=$filter('orderBy')(scope[curConfig.scopeKey], reverseFlag+''+curConfig.key);
                        curConfig.orgListName=(isEmpty(curConfig.orgListName)?'store'+curConfig.key+'List':curConfig.orgListName);
                        scope[curConfig.orgListName] = _.cloneDeep(scope[curConfig.scopeKey]);
                        scope[curConfig.allKey]=true;
                        scope[curConfig.filterDisplayLength]=scope[curConfig.scopeKey].length;
                    });
                }

            }
            var buildFilterComponentHtml=function(filterConfig,option){
                var columnNum=scope.columnnumber==null?2:scope.columnnumber;
                var areaClass= "col-md-"+ parseInt(12/columnNum);
                var compoentHtml="";

                filterConfig.forEach(function(curConfig){
                    var startHtml="<div class=\""+areaClass+"\"> ";

                    var titleBox="<div class=\"l-row filter-label-box\">"+curConfig.filterTitle+"</div>";

                    var intputBox="<div class=\"l-row filter-input-box\">"+" <input ng-keyup=\"listenKeyBoard($event,'"+curConfig.key+"')\" placeholder=\"Type to search in list\" ng-model=\""+curConfig.inputFilterName+"\">"+"</div>";

                    var startContent="<div class=\"l-row filter-area-box\">";
                    var ulStartContent="<ul class=\"filter-ul\"   >";
                    var liAllContent="<li ng-class=\"{'opn-hight-light': "+curConfig.allKey+"  ==true}\"  ng-click=\"initFilterAll('"+curConfig.key+"')\" >"+
                        "<b>(All : <span ng-bind=\""+curConfig.filterDisplayLength+"\"></span> )</b></li>";

                    var liContent="<li ng-repeat=\"curItem in "+curConfig.scopeKey+" | filter:"+curConfig.inputFilterName+" as results\" "+
                                            "ng-class=\"{'opn-hight-light':curItem.isSelected==true}\" "+
                                            "title=\"{[{curItem."+curConfig.key+"}]}\" "+
                                            "ng-mousedown=\"clickFilterColumn($event,$index,'"+curConfig.key+"',curItem)\" "+
                                            "class=\"label-long-hide\" ng-show=\"curItem.isDisplay\"> "+
                                            "<span ng-bind=\"curItem."+curConfig.key+"\"></span> "+
                                        "</li>";
                    var ulEndContent="</ul>";
                    var endContent="</div>";
                    var contentBox=startContent+ulStartContent+liAllContent+liContent+ulEndContent+endContent;

                    var endHtml="</div>";

                    compoentHtml=compoentHtml+startHtml+titleBox+intputBox+contentBox+endHtml;
                });

                element.html(compoentHtml);
                $compile(element.contents())(scope);
            }
            scope.$watch("data",function(newvalue){
                if(newvalue.length>0 && scope.config.length>0){
                    initFilterComponent(newvalue, scope.config);
                    /**if($("#aaaaa:has(div)").length==0){
                        debugger;
                        buildFilterComponentHtml(scope.config);
                    }**/
                    buildFilterComponentHtml(scope.config);
                }
            });



            /**call back result**/
            var getMapperSelectFilterValues =function(selectResult,filterKey,selectFilterValueList){
                var newResult=[];
                selectResult.forEach(function(curSelectItem){
                    var curFilterValue=_.isEmpty(curSelectItem[filterKey])?'(Empty)':curSelectItem[filterKey];
                    selectFilterValueList.forEach(function(curItem){
                        if(curFilterValue==curItem){
                            newResult.push(curSelectItem);
                        }
                    });
                });
                return newResult;
            }
            var getMapperAllFilterResult =function(selectResult,selectKey){
               var newResult= _.cloneDeep(selectResult);
               scope.filterComponentConfig.forEach(function(curConfig){
                    if(curConfig['key']!=null && curConfig['key']!=selectKey){
                       if(curConfig['allKey']!=null && !scope[curConfig['allKey']]){
                            var filterKey=curConfig['key'];
                            var filterScopeKeyName=curConfig['scopeKey'];
                            var filterCurSelectName=curConfig['curSelectName'];
                            var selectFilterValueList=scope[filterCurSelectName];
                            if(filterCurSelectName!=null && filterKey!=null &&
                            selectFilterValueList!=null){
                                    newResult=getMapperSelectFilterValues(newResult,filterKey,selectFilterValueList);
                            }
                       }
                    }
               });
               return newResult;
            }
            var callResultByKey=function(mappingConfig){
                var key=mappingConfig.key;
                var filterMainKey=mappingConfig.filterKey;
                var curFilterConfig=findFilterObjectByKey(key);
                var curfilterKey=curFilterConfig.key;
                var curfilterScopeKey=curFilterConfig.scopeKey;
                var curfilterAllKey=curFilterConfig.allKey;

                var matchKeyList=scope[curfilterScopeKey];
                var newMatchResults=[];
                scope.filterComponentOrgDataList.forEach((curItem)=>{
                    matchKeyList.forEach((curRecord)=>{
                        var checkValue={
                            filterKey:curItem[filterMainKey]
                        };
                        if(curItem[key]==curRecord[key]){
                            var matchCheckRecord=_.find(newMatchResults, checkValue);
                            if(_.isEmpty(matchCheckRecord)){
                                if(!scope[curfilterAllKey]){
                                      if(curRecord.isSelected && curRecord.isDisplay){
                                            var newValue=_.cloneDeep(curItem);
                                            newValue.isSelected=true;
                                            newMatchResults.push(newValue);
                                      }
                                }else if(curRecord.isDisplay){
                                    var newValue=_.cloneDeep(curItem);
                                    newValue.isSelected=false;
                                    newMatchResults.push(newValue);
                                }
                            }
                        }
                    });
                });
                if(newMatchResults.length>0){
                    newMatchResults= getMapperAllFilterResult(newMatchResults,key);
                }
                return newMatchResults;
            }
            var callRelatedFunction =function(){
                var mappingConfig=scope.mappingconfig;
                if(mappingConfig!=null && mappingConfig.key!=null && mappingConfig.filterKey!=null){
                    var newMatchResults=callResultByKey(mappingConfig);

                    scope.$emit('callFilterCompoentResults',newMatchResults);
                }else{
                    console.warn('call result mapping config is empty!');
                }
            }

            /**listen click event**/
            var findFilterObjectByKey=function(filterKey){
                    var curFilterObject=null;
                    scope.filterComponentConfig.forEach(function(curConfig){
                         if(curConfig.key==filterKey){
                            curFilterObject=curConfig;
                         }
                   });
                   return curFilterObject;
            }
            var getSelectedFilterDataByKey=function(result,key,valueFlag){
                 var markRecords=[];
                 if(result!=null && OP.toString.call(result) === '[object Array]'){
                    result.forEach(function(curItem){
                        var curValue=curItem[key];
                        if(curItem.isSelected && markRecords.indexOf(curValue)==-1){
                             if(valueFlag){
                                markRecords.push(curValue);
                             }else{
                                markRecords.push(curItem);
                             }
                        }
                     })
                 }
                 return markRecords;
            }
            var mapperSelectFilterToResult=function(resultsData,selectData,key){
                 resultsData.forEach(function(curItem){
                    curItem.isSelected=false;
                    for(var i=0;i<selectData.length;i++){
                        if(curItem[key]==selectData[i]){
                            curItem.isSelected=true;
                            break;
                        }
                    }
                });
            }
            var handleFilterListByOtherFilter=function(newFilterScopeKeyList,newfilterKey, markRecords, markfilterKey){
                var newOtherScopeKeyList=[];
                scope.filterComponentOrgDataList.forEach(function(curItem){
                    var curItemValue=_.isEmpty(curItem[markfilterKey])?'(Empty)':curItem[markfilterKey];
                    markRecords.forEach(function(curMark){
                        if(curItemValue==curMark){
                            let curValue=curItem[newfilterKey];
                            if( typeof curValue != 'undefined'){
                                curValue=_.isEmpty(curValue)?'(Empty)':curValue;
                                var checkValue={};
                                checkValue[newfilterKey]=curValue;
                                if( _.isEmpty(_.find(newOtherScopeKeyList, checkValue)) && !_.isEmpty(_.find(newFilterScopeKeyList, checkValue))){
                                    var newValue={};
                                    newValue[newfilterKey]=curValue;
                                    newOtherScopeKeyList.push(newValue);
                                }
                            }
                        }
                    });
                });
                return newOtherScopeKeyList;
            }
            var listerCurFilterAllStatus=function(results,curfilterAllKey,curfilterSelectName){
                 var selectAllFlag=true;
                 for(var i=0;i<results.length;i++){
                    if(results[i].isSelected){
                        selectAllFlag=false;
                        break;
                    }
                 }
                 scope[curfilterAllKey]=selectAllFlag;
                 if(selectAllFlag){
                    scope[curfilterSelectName]=[];
                 }
            }
            var handleDisplayList=function(curAllFilterList,newFilterList,curfilterKey,curfilterDisplayLength){
                var validList=[];
                curAllFilterList.forEach(function(curFilter){
                    var isShow=false;
                    var selectStatus=false;
                    newFilterList.forEach(function(curItem){
                        if(curFilter[curfilterKey]==curItem[curfilterKey]){
                            isShow=true;
                            selectStatus=curItem.isSelected;
                            validList.push(curItem);
                            return false;
                        }
                    });
                    curFilter.isDisplay=isShow;
                    curFilter.isSelected=selectStatus;
                });
                scope[curfilterDisplayLength]=validList.length;
            }
            var getOtherFilterDataByFilterKey=function(filterKey,markRecords,curFilterConfig){
                var curfilterKey=curFilterConfig.key;
                var curfilterScopeKey=curFilterConfig.scopeKey;
                var curfilterOrderFlag=curFilterConfig.orderFlag;
                var curfilterAllKey=curFilterConfig.allKey;
                var curfilterSelectName=curFilterConfig.curSelectName;
                var curfilterDisplayLength=curFilterConfig.filterDisplayLength;

                var newFilterScopeKeyList=[];
                scope.filterComponentOrgDataList.forEach(function(curItem){
                    var curItemValue=_.isEmpty(curItem[filterKey])?'(Empty)':curItem[filterKey];
                    markRecords.forEach(function(curMark){
                        if(curItemValue==curMark){
                            let curValue=curItem[curfilterKey];
                            if( typeof curValue != 'undefined'){
                                curValue=_.isEmpty(curValue)?'(Empty)':curValue;
                                var checkValue={};
                                checkValue[curfilterKey]=curValue;
                                if( _.isEmpty(_.find(newFilterScopeKeyList, checkValue))){
                                    var newValue={};
                                    newValue[curfilterKey]=curValue;
                                    newFilterScopeKeyList.push(newValue);
                                }
                            }
                        }
                    });
                });
                //filter other config
                if(newFilterScopeKeyList.length>0){
                    scope.filterComponentConfig.forEach(function(curConfig){
                        if(curConfig['key']!=null && curConfig['key']!=filterKey && curConfig['key']!=curfilterKey){
                            if(!scope[curConfig['allKey']]){
                                newFilterScopeKeyList=handleFilterListByOtherFilter(newFilterScopeKeyList,curfilterKey,scope[curConfig['curSelectName']],curConfig['key']);
                            }
                        }
                    })
                }
                if(newFilterScopeKeyList.length>0){
                    //handle weather selected
                    var selectedList=[];
                    if(scope[curfilterScopeKey]!=null && OP.toString.call(scope[curfilterScopeKey]) === '[object Array]'){
                        selectedList=getSelectedFilterDataByKey(scope[curfilterScopeKey],curfilterKey,true);
                    }
                    mapperSelectFilterToResult(newFilterScopeKeyList,selectedList,curfilterKey);
                    var reverseFlag=(curfilterOrderFlag==1?'+':'-');
                    newFilterScopeKeyList=$filter('orderBy')(newFilterScopeKeyList, reverseFlag+''+curfilterKey);
                }

                handleDisplayList(scope[curfilterScopeKey],newFilterScopeKeyList,curfilterKey,curfilterDisplayLength);

                listerCurFilterAllStatus(newFilterScopeKeyList,curfilterAllKey,curfilterSelectName);
            }
            var filterOtherComponent=function(filterKey,filterAllKey,markRecords){
                if(!scope[filterAllKey]){
                    scope.filterComponentConfig.forEach(function(curConfig){
                        if(curConfig['key']!=null && curConfig['key']!=filterKey){
                            getOtherFilterDataByFilterKey(filterKey,markRecords,curConfig);
                        }
                    });
                }
            }
            scope.clickFilterColumn=function(e,curIndex,filterKey,curItem){
                var curSelectFilterObject=findFilterObjectByKey(filterKey);
                if(curSelectFilterObject!=null){
                    var filterScopeKey=curSelectFilterObject.scopeKey;
                    var filterAllKey=curSelectFilterObject.allKey;
                    var filterCurSelectName=curSelectFilterObject.curSelectName;
                    var filterCurMarkIndexName=curSelectFilterObject.curMarkIndexName;
                    var filterCurInputName=curSelectFilterObject.inputFilterName;
                    var filterCurDisplayLength=curSelectFilterObject.filterDisplayLength;
                    var oldMarkMutilFilterRecord=getSelectedFilterDataByKey(scope[filterScopeKey],filterKey,true);
                    if( typeof scope[filterCurInputName] !='undefined'  && scope[filterCurInputName]!=null && scope[filterCurInputName]!=''){
                        var filterInputValue= {};
                        filterInputValue[filterKey]=scope[filterCurInputName];
                        scope[filterScopeKey]=$filter('filter')(scope[filterScopeKey],filterInputValue);
                    }
                    var matchFlag=false;
                    if(!curItem.isSelected){
                        scope[filterAllKey]=false;
                        if(curSelectFilterObject!=null){
                            if(e.shiftKey){
                                 let beginIndex=curIndex;
                                 let endIndex=scope[filterCurMarkIndexName];
                                 if(scope[filterCurMarkIndexName]<curIndex){
                                    beginIndex=scope[filterCurMarkIndexName];
                                    endIndex=curIndex;
                                 }
                                 var curLength=scope[filterScopeKey].length;
                                 for(let i=0;i<curLength;i++){
                                     scope[filterScopeKey][i].isSelected=(i>=beginIndex && i<=endIndex?true:false);
                                 }
                            }else if(e.ctrlKey){
                                scope[filterScopeKey][curIndex].isSelected=true;
                                scope[filterCurMarkIndexName]=curIndex;
                            }else{
                                  scope[filterCurMarkIndexName]=curIndex;
                                  var curLength=scope[filterScopeKey].length;
                                  for(let i=0;i<curLength;i++){
                                       scope[filterScopeKey][i].isSelected=(i==curIndex?true:false);
                                  }
                            }
                        }
                        matchFlag=true;
                    }else if(oldMarkMutilFilterRecord.length>1){
                        matchFlag=true;
                        var curValue=curItem[filterKey];
                        scope[filterScopeKey].forEach(function(curRecord){
                             curRecord.isSelected=(curRecord[filterKey]==curValue?true:false);
                        });
                    }
                    if(matchFlag){
                        var newMarkMutilFilterRecord=getSelectedFilterDataByKey(scope[filterScopeKey],filterKey,true);
                        scope[filterCurSelectName]= _.cloneDeep(newMarkMutilFilterRecord);
                        filterOtherComponent(filterKey,filterAllKey,newMarkMutilFilterRecord);
                        callRelatedFunction();
                    }
                }
            }

            var checkOtherFilterAllStatus=function(curConfig){
                var filterKey=curConfig.key;
                var filterScopeKey=curConfig.scopeKey;
                var filterAllKey=curConfig.allKey;
                var filterOrgListName=curConfig.orgListName;
                var allFlag=true;
                var filterComponentConfigLength=scope.filterComponentConfig.length;
                for(var i=0;i<filterComponentConfigLength;i++){
                    var curConfig=scope.filterComponentConfig[i];
                    if(curConfig['key']!=null && curConfig['key']!=filterKey){
                        if(!scope[curConfig['allKey']]){
                            allFlag=false;
                            filterOtherComponent(curConfig['key'],curConfig['allKey'], scope[curConfig['curSelectName']]);
                        }
                    }
                }
                if(allFlag){
                    scope.filterComponentConfig.forEach(function(otherConfig){
                        //var scopeKeyListLength= $scope[otherConfig['scopeKey']].length;
                        //var orgListNameLength= $scope[otherConfig['orgListName']].length;
                        if(otherConfig['key']!=null && otherConfig['key']!=filterKey){
                             scope[otherConfig['scopeKey']] = _.cloneDeep(scope[otherConfig['orgListName']]);
                             scope[otherConfig['curSelectName']]=[];
                             scope[otherConfig['filterDisplayLength']]=scope[otherConfig['scopeKey']].length;
                        }
                    })
                }
            }
            scope.initFilterAll=function(key){
                var curObject=findFilterObjectByKey(key);
                if(curObject!=null){
                    scope[curObject['scopeKey']] = _.cloneDeep(scope[curObject['orgListName']]);
                    scope[curObject['allKey']]=true;
                    scope[curObject['curSelectName']]=[];
                    scope[curObject['filterDisplayLength']]=scope[curObject['scopeKey']].length;
                    checkOtherFilterAllStatus(curObject);
                    callRelatedFunction();
                }
            }

            /**listen key event**/
            var getCurItem=function(e,upFlag,filterKey){
                var curSelectFilterObject=findFilterObjectByKey(filterKey);
                var filterScopeKey=curSelectFilterObject.scopeKey;
                var filterCurInputName=curSelectFilterObject.inputFilterName;
                var filterCurAllkey=curSelectFilterObject.allKey;
                if(typeof scope[filterCurInputName] !='undefined'  && scope[filterCurInputName]!=null && scope[filterCurInputName]!=''){
                        var filterInputValue= {};
                        filterInputValue[filterKey]=scope[filterCurInputName];
                        scope[filterScopeKey]=$filter('filter')(scope[filterScopeKey],filterInputValue);
                }

                var allKeyValue=scope[filterCurAllkey];
                var scopekeyList=scope[filterScopeKey];
                var scopekeyLength=scopekeyList.length;
                var preIndex=-1;
                var curIndex=-1;
                var nextIndex=-1;
                var preItem=null;
                var curItem=null;
                var nextItem=null;
                var selectAll=false;
                var nochange=false;
                for(var i=0;i<scopekeyLength;i++){
                    var curRecord=scopekeyList[i];
                    if(curRecord.isDisplay){
                        if(allKeyValue){
                            if(!upFlag){
                                curIndex=i;
                                curItem=curRecord;
                            }else{
                                nochange=true;
                            }
                            break;
                        }else if(curRecord.isSelected){
                            curIndex=i;
                            curItem=curRecord;
                            preIndex=i-1;
                            nextIndex=i+1;
                            var startIndex=(upFlag?preIndex:nextIndex);
                            if(upFlag){
                                for(var j=startIndex;j>=-1;j--){
                                    if(j==-1){
                                        selectAll=true;
                                        break;
                                    }
                                    var curPreRecord=scopekeyList[j];
                                    if(curPreRecord.isDisplay){
                                        curIndex=j;
                                        curItem=curPreRecord;
                                        break;
                                    }

                                }
                            }else{
                                for(var k=startIndex;k<scopekeyLength;k++){
                                    var curNextRecord=scopekeyList[k];
                                    if(curNextRecord.isDisplay){
                                        curIndex=k;
                                        curItem=curNextRecord;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
                if(!nochange){
                    if(selectAll){
                       scope.initFilterAll(filterKey);
                    }else{
                        scope.clickFilterColumn(e,curIndex,filterKey,curItem);
                    }
                }

            }

            scope.listenKeyBoard=function(e,key){
                var keyCode=e.keyCode;
                if(keyCode==38 || keyCode==40){
                    var curItem={};
                    var curIndex=getCurItem(e,keyCode==38,key);
                    //scope.clickFilterColumn(e,curIndex,key,curItem);
                }
            }
        }
    }
}]);

