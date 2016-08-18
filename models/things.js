/* jshint esnext:true, globalstrict:true */
/* global require, module, console, __dirname */

'use strict';

const validator = require('validator');
const Q 				= require('q');
const bcrypt		= require('bcrypt');
const db 				= require('./database.js');
const sql 			= require('./queries.js');

function is_valid_thing(thing) {
	if (!thing.name) return false;
	return true;
}

function exists (results) {
	if(results.rowCount===1)
		return results.rows[0];
	else if(results.rowCount > 1) {
		return results.rows;
	}	else throw "No such thing!";
}

/** Interface to Things within the database. */
class Things {

	constructor () {
		//select statements
		// let variables = "u.user_id as owner_id, u.name as owner, t.thing_id, t.name, t.description";
		// let join = "INNER JOIN users u USING (user_id) INNER JOIN things t USING (thing_id)";
		// this.select_needs = "SELECT needs.need_id as id, needs.public, " + variables + " FROM needs " + join;
		// this.select_haves = "SELECT haves.have_id as id, haves.public, " + variables + " FROM haves " + join;
		// this.select_needs_with_user_id = this.select_needs + "WHERE user_id = $1";
		// this.select_haves_with_user_id = this.select_haves + "WHERE user_id = $1";
		// this.select_need_with_id = "SELECT needs.need_id, t.thing_id, t.name, t.description, needs.public FROM needs INNER JOIN things t USING (thing_id) WHERE need_id=$1";
		// this.select_have_with_id = "SELECT haves.have_id, t.thing_id, t.name, t.description, haves.public FROM haves INNER JOIN things t USING (thing_id) WHERE have_id=$1";
		// //insert statments
		// this.insert_into_things = "INSERT INTO things (name,description, creator) VALUES ($1, $2, $3) RETURNING thing_id";
		// this.insert_into_haves = "INSERT INTO haves (user_id, thing_id, public) VALUES ($1, $2, $3)";
		// this.insert_into_needs = "INSERT INTO needs (user_id, thing_id, public) VALUES ($1, $2, $3)";
		// //update statements
	}

	static random () {
		//this should be optimised so that it does not count things list every time.
		return db.query(sql.select.things.random)
			.then(result => {
				if(result.rowCount>0){
					return result.rows[0];
				}	else { 
					return { name: "something",
									 description:"" };
				}
			});
	}

	static have (id) {
		return db.query(sql.select.haves.with_id, [ id ])
			.then( res => res.rows[0] );
	}

	static haves (user) {
		var q;
		if(user && user.admin) {
			//get everything
			q = db.query(sql.select.haves.all, [user.user_id]);
		} else {
			//get only public
			let id = (user) ? user.user_id : null;
			q = db.query(sql.select.haves.all_public, [ id ]);
		}
		return q.then( res => res.rows );
	}

	static need (id) {
		return db.query(sql.select.needs.with_id, [ id ])
			.then( res => res.rows[0] );
	}

	static needs (user) {
		var q;
		if(user &&  user.admin) {
			//get everything
			q = db.query(sql.select.needs.all, [user.user_id]);
		} else {
			//get only public
			let id = (user) ? user.user_id : null;
			q = db.query(sql.select.needs.all_public, [ id ]);
		}
		return q.then( res => res.rows );
	}
}

/*global exports:true*/
exports = module.exports = Things;
