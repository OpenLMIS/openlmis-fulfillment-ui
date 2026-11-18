/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name transfer-request.transferRequestService
     *
     * @description
     * Reads and deletes transfer request orders through the /api/orders endpoint. Saving and sending
     * go through transferService, because the order endpoints reject transfer requests.
     */
    angular
        .module('transfer-request')
        .service('transferRequestService', service);

    service.$inject = ['$resource', '$http', 'fulfillmentUrlFactory'];

    function service($resource, $http, fulfillmentUrlFactory) {

        var resource = $resource(fulfillmentUrlFactory('/api/orders/:id'));

        this.get = get;
        this.delete = deleteOrders;

        function get(orderId) {
            return resource.get({
                id: orderId
            }).$promise;
        }

        function deleteOrders(orderIds) {
            return $http({
                method: 'DELETE',
                url: fulfillmentUrlFactory('/api/orders'),
                data: {
                    ids: orderIds
                },
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });
        }
    }
})();
