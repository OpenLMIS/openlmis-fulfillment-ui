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

describe('transferRequestService', function() {

    var transferRequestService, $rootScope, $httpBackend, fulfillmentUrlFactory;

    beforeEach(function() {
        module('transfer-request', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            transferRequestService = $injector.get('transferRequestService');
            fulfillmentUrlFactory = $injector.get('fulfillmentUrlFactory');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not offer the requisition-less order calls', function() {
        expect(transferRequestService.create).toBeUndefined();
        expect(transferRequestService.update).toBeUndefined();
        expect(transferRequestService.send).toBeUndefined();
    });

    describe('get', function() {

        it('should get the order from /api/orders/{id}', function() {
            $httpBackend.expectGET(fulfillmentUrlFactory('/api/orders/order-id')).respond(200, {
                id: 'order-id',
                type: 'TRANSFER_REQUEST'
            });

            var result;
            transferRequestService.get('order-id')
                .then(function(order) {
                    result = order;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(result.type).toEqual('TRANSFER_REQUEST');
        });
    });

    describe('delete', function() {

        it('should delete the orders through /api/orders', function() {
            $httpBackend.expect('DELETE', fulfillmentUrlFactory('/api/orders'), {
                ids: ['order-id']
            }).respond(204);

            var resolved = false;
            transferRequestService.delete(['order-id'])
                .then(function() {
                    resolved = true;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(resolved).toBe(true);
        });
    });
});
