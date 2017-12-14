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

describe('orderRepository', function() {

    var orderRepository, orderServiceMock;

    beforeEach(function() {
        module('order', function($provide) {
            orderServiceMock = createMock($provide, 'orderService', ['search', 'searchOrdersForManagePod']);
        });

        inject(function($injector) {
            orderRepository = $injector.get('orderRepository');
        });
    });

    describe('search', function() {
        it('should call orderService with correct params', function() {
            var searchParams = {
                program: 'id-one',
                supplyingFacility: 'id-two',
                requestingFacility: 'id-three'
            };
            orderRepository.search(searchParams);

            expect(orderServiceMock.search).toHaveBeenCalledWith(searchParams);
        });

        it('should call orderService with only one param', function() {
            var searchParam = {
                supplyingFacility: 'id-two',
            };
            orderRepository.search(searchParam);

            expect(orderServiceMock.search).toHaveBeenCalledWith(searchParam);
        });
    });

});

function createMock($provide, name, methods) {
    var mock = jasmine.createSpyObj(name, methods);
    $provide.factory(name, function() {
        return mock;
    });
    return mock;
}
