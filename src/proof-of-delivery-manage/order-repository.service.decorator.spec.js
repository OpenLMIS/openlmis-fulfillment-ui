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

describe('orderRepository decorator', function() {

    var orderRepository, orderServiceMock, ORDER_STATUS, $q;

    beforeEach(function() {
        module('proof-of-delivery-manage', function($provide) {
            orderServiceMock = createMock($provide, 'orderService', ['search']);
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
            // these specs assert today's requests, which are sent only while transfers are off
            $provide.constant('SHOW_TRANSFERS', false);
        });

        inject(function($injector) {
            ORDER_STATUS = $injector.get('ORDER_STATUS');
            orderRepository = $injector.get('orderRepository');
            $q = $injector.get('$q');
        });
    });

    describe('searchOrdersForManagePod', function() {
        it('should call orderService with id param', function() {
            orderServiceMock.search.andReturn($q.when());
            var searchParams = {
                requestingFacility: 'id-one',
                program: 'id-two'
            };
            orderRepository.searchOrdersForManagePod(searchParams);

            expect(orderServiceMock.search).toHaveBeenCalledWith({
                requestingFacility: 'id-one',
                program: 'id-two',
                status: [
                    ORDER_STATUS.TRANSFER_FAILED,
                    ORDER_STATUS.READY_TO_PACK,
                    ORDER_STATUS.RECEIVED,
                    ORDER_STATUS.SHIPPED,
                    ORDER_STATUS.IN_ROUTE
                ]
            });
        });
    });

});

describe('orderRepository decorator with transfers enabled', function() {

    var orderRepository, orderServiceMock, ORDER_STATUS, $q;

    beforeEach(function() {
        module('proof-of-delivery-manage', function($provide) {
            orderServiceMock = createMock($provide, 'orderService', ['search']);
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
            $provide.constant('SHOW_TRANSFERS', true);
        });

        inject(function($injector) {
            ORDER_STATUS = $injector.get('ORDER_STATUS');
            orderRepository = $injector.get('orderRepository');
            $q = $injector.get('$q');
        });

        orderServiceMock.search.andReturn($q.when());
    });

    it('should search requisition and requisition-less orders by default', function() {
        orderRepository.searchOrdersForManagePod({
            programId: 'program-id'
        });

        expect(orderServiceMock.search.mostRecentCall.args[0].type).toEqual(['REQUISITION', 'REQUISITION_LESS']);
    });

    it('should keep the chosen order type', function() {
        orderRepository.searchOrdersForManagePod({
            programId: 'program-id',
            type: 'TRANSFER_REQUEST'
        });

        expect(orderServiceMock.search.mostRecentCall.args[0].type).toEqual('TRANSFER_REQUEST');
    });

    it('should not change the given search params', function() {
        var searchParams = {
            programId: 'program-id'
        };

        orderRepository.searchOrdersForManagePod(searchParams);

        expect(searchParams).toEqual({
            programId: 'program-id'
        });

        expect(orderServiceMock.search.mostRecentCall.args[0].status).toEqual([
            ORDER_STATUS.TRANSFER_FAILED,
            ORDER_STATUS.READY_TO_PACK,
            ORDER_STATUS.RECEIVED,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.IN_ROUTE
        ]);
    });
});

function createMock($provide, name, methods) {
    var mock = jasmine.createSpyObj(name, methods);
    $provide.factory(name, function() {
        return mock;
    });
    return mock;
}
