import test from 'node:test';
import assert from 'node:assert/strict';
import {deskUpdate,packageValues} from '../lib/admin-rules.js';
import {quote} from '../lib/catalog.js';
const b={guests:6,balance:15000,status:'confirmed'};
test('a six-person table can arrive and depart in smaller groups',()=>{
 const arrived={...b,...deskUpdate(b,'enter',4)};
 const left={...arrived,...deskUpdate(arrived,'exit',2)};
 assert.equal(left.entered-left.exited,2);
 assert.throws(()=>deskUpdate(left,'enter',3));assert.throws(()=>deskUpdate(left,'exit',3));
 assert.throws(()=>deskUpdate(left,'enter',0.5));
});
test('counter collections respect outstanding balance and payment status',()=>{
 const updated={...b,...deskUpdate(b,'collect',10000)};
 assert.deepEqual(deskUpdate(updated,'collect',5000),{collected:15000});
 assert.throws(()=>deskUpdate(updated,'collect',5000.01));
 assert.throws(()=>deskUpdate(b,'collect',-1));assert.throws(()=>deskUpdate({...b,status:'pending'},'enter',1));
});
test('published package quantities and percentages apply to customer checkout',()=>{
 const item=packageValues({id:'group',name:'Group table',unit:'table',guests:4,price:7999,advancePercent:35,description:''});
 const q=quote('group',2,[item]);assert.equal(q.guests,8);assert.equal(q.advance,5599.3);assert.equal(q.balance,10398.7);
 assert.equal(quote('vip',1).advance,15000);assert.throws(()=>quote('missing',1,[item]));
});
