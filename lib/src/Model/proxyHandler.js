"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyHandler = void 0;
exports.proxyHandler = {
    get(target, prop) {
        if (typeof target[prop] !== 'undefined') {
            return Reflect.get(target, prop);
        }
        return Reflect.get(target.$currentData, prop);
    },
    set(target, prop, value) {
        if (typeof target[prop] !== 'undefined') {
            return Reflect.set(target, prop, value);
        }
        return Reflect.set(target.$currentData, prop, value);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVsL3Byb3h5SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLFlBQVksR0FBRztJQUMxQixHQUFHLENBQUMsTUFBVyxFQUFFLElBQVk7UUFDM0IsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDdkMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNsQztRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxHQUFHLENBQUMsTUFBVyxFQUFFLElBQVksRUFBRSxLQUFVO1FBQ3ZDLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssV0FBVyxFQUFFO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDRixDQUFDIn0=