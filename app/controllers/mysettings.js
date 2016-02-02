/**
 * Application MySettings controller
 * @author Martin Vach
 */

/**
 * My Access
 */
myAppController.controller('MySettingsController', function($scope, $window, $location,$cookies,$timeout,dataFactory, dataService, myCache) {
    $scope.id = $scope.user.id;
    $scope.devices = {};
    $scope.input = false;
    $scope.newPassword = null;
    
    /**
     * Load data
     */
    $scope.loadData = function(id) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
       dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            loadDevices();
            $scope.input = response.data.data;
           $scope.loading = false;
           dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    }

    /**
     * Assign device to list
     */
    $scope.assignDevice = function(assign) {
        $scope.input.hide_single_device_events.push(assign);
        return;

    };
    /**
     * Remove device from the list
     */
    $scope.removeDevice = function(deviceId) {
        var oldList = $scope.input.hide_single_device_events;
        $scope.input.hide_single_device_events = [];
        angular.forEach(oldList, function(v, k) {
            if (v != deviceId) {
                $scope.input.hide_single_device_events.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(form,input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            $scope.loading = false;
            $cookies.lang = input.lang;
            myCache.remove('profiles');
            dataService.setUser(data);
             dataService.showNotifier({message: $scope._t('success_updated')});
             $timeout(function () {
                 alertify.dismissAll();
                $window.location.reload();
            }, 3000);

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
             alertify.alertError(message);
            $scope.loading = false;
        });
    };

    /**
     * Change password
     */
    $scope.changePassword = function(form,newPassword) {
        if (form.$invalid) {
            return;
        }
//       if (!newPassword || newPassword === '' || newPassword === $scope.cfg.default_credentials.password) {
//            alertify.alertError($scope._t('enter_valid_password'));
//            $scope.loading = false;
//            return;
//        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});
            $window.history.back();

        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

});
