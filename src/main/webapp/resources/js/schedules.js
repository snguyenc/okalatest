/**
 * Created with IntelliJ IDEA.
 * User: Nguyen
 * Date: 9/20/14
 * Time: 12:25 PM
 * To change this template use File | Settings | File Templates.
 */
var listURL = "listSchedules.json";
var addModelURL = "addSchedules.json";
var deleteModelURL = "deleteSchedules.json";

cruiseApp.controller('UserGroupCtrl', function ($scope, $modal, $log) {
    $scope.open = function (size, userForm) {
        var modalInstance = $modal.open({
            templateUrl: 'addUserGroup.html',
            controller: ModalInstanceCtrl,
            size: size,
            backdrop: 'static',
            windowClass: 'modal-top',
            resolve: {
                userForm: function () {
                    return userForm;
                }
            }
        });
    };


    $scope.filterItemSelect = function($event, id, name){
        $scope.filterId = id;
        $($event.target).parents('.btn-group').find('.dropdown-toggle').html(name+' <span class="caret"></span>');
        //trigger refesh table
        $('#userGroupTable').bootstrapTable('refresh');
    }

    $scope.delete = function () {
        var selected = $('#userGroupTable').bootstrapTable('getSelections');
        var ids = [];
        if(selected && selected.length >0) {
            $.each(selected, function(idx, row){
                if(row.role != 'ADMIN'){
                    ids.push(row.id);
                }
            })
        }
        if(ids.length > 0) {
            bootbox.confirm("Are  you sure you want to remove it", function(result) {
                if(result) {
                    $.ajax({
                        type: "GET",
                        url: deleteModelURL,
                        data: {
                            ids: ids.join(',')
                        },
                        dataType: 'json'
                    })
                    .done(function(data) {
                        $('#userGroupTable').bootstrapTable('refresh');
                    })
                    .fail(function() {

                    });
                }
            });
        }
    };

});

var ModalInstanceCtrl = function ($scope, $modalInstance, $http, userForm) {

    $scope.userForm = userForm || {};
    $scope.userForm.isUpdate = $scope.userForm.id > 0;

    if(!$scope.userForm.cruiseId) {
        $scope.userForm.cruiseName = 'Select cruise';
        $scope.userForm.passengers = 0;
        $scope.userForm.callType = 'Transit';
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.itemSelect = function($event, id, name){
        $scope.userForm.cruiseId = id;
        $($event.target).parents('.btn-group').find('.dropdown-toggle').html(name+' <span class="caret"></span>');
    }

    $scope.callTypeSelect = function($event, id, name){
        $scope.userForm.callType = id;
        $($event.target).parents('.btn-group').find('.dropdown-toggle').html(name+' <span class="caret"></span>');
    }

    $scope.submit = function (form) {
        if(form.$valid) {
            if(!$scope.userForm.cruiseId){
                bootbox.alert('Please select crusie name');
                return ;
            }
            $http({
                method: "post",
                url: addModelURL,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: $.param($scope.userForm)
            }).success(function(data, status, headers, config) {
                if(!data.success){
                    bootbox.alert(data.errorMsg);
                } else {
                    $modalInstance.close();
                    $('#userGroupTable').bootstrapTable('refresh');
                }
            }).
            error(function(data, status, headers, config) {
                alert("have error")
            });
        } else {
            alert("Please input required field");
        }
    };

    $scope.$watch(
        function () { return document.getElementById('datetimepicker9').innerHTML },
        function(newval, oldval){
            $('#datetimepicker9').datetimepicker({
                minDate: moment(),
                showToday: true
            });
            $("#datetimepicker9").on("dp.change",function (e) {
                $('#datetimepicker10').data("DateTimePicker").setMinDate(e.date);
                $scope.userForm.arrivalTime = e.date.format('YYYY/MM/DD HH:mm');
            });
    }, true);

    $scope.$watch(
        function () { return document.getElementById('datetimepicker10').innerHTML },
        function(newval, oldval){
            $('#datetimepicker10').datetimepicker({
                showToday: true
            });
            $("#datetimepicker10").on("dp.change",function (e) {
                $scope.userForm.departureTime = e.date.format('YYYY/MM/DD HH:mm');
                $('#datetimepicker9').data("DateTimePicker").setMaxDate(e.date);
            });
    }, true);

};

function operateFormatter(value, row, index) {
    return [
        '<a class="remove ml10" href="javascript:void(0)" title="Remove">',
        '<i class="glyphicon glyphicon-remove"></i>',
        '</a>'
    ].join('');
}

window.operateEvents = {

    'click .remove': function (e, value, row, index) {
        bootbox.confirm("Are  you sure you want to remove it", function(result) {
            if(result) {
                $.ajax({
                    type: "GET",
                    url: deleteModelURL,
                    data: {
                        ids: row.id
                    },
                    dataType: 'json'
                })
                .done(function(data) {
                    $('#userGroupTable').bootstrapTable('refresh');
                })
                .fail(function() {

                });
            }
        });
    }
};

function queryParams(params) {
    var scope = angular.element('[ng-controller=UserGroupCtrl]').scope();
    return {
        limit: params.pageSize,
        offset: params.pageSize * (params.pageNumber - 1),
        search: params.searchText,
        name: params.sortName,
        order: params.sortOrder,
        filterId: scope.filterId
    };
}

function rowStyle(row, index) {

    if (index % 2 === 0) {
        return {
            classes: 'active'
        };
    }
    return {};
}

$(function () {
    setTimeout(function(){$('#userGroupTable').bootstrapTable({
        url: listURL
    })}, 100);

});
