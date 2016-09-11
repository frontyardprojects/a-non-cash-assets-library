/* jshint esnext:true, globalstrict:true */
/* global require, module, console, __dirname */

"use strict";

const Q 				= require('q');
const moment    = require('moment');

const db 				= require('./database.js');
const sql 			= require('./queries');
const transactions = require('../transactions/');

class Matches {

	static add (have_id, need_id) {
		return db.query(sql.insert.match,[have_id,need_id])
						.tap(() => 
							Q.all([
								db.query('SELECT users.name AS name, users.email as email, t.name as have FROM users INNER JOIN haves USING (user_id) INNER JOIN things t USING (thing_id) WHERE haves.have_id = $1',[have_id]),
								db.query('SELECT users.name AS name FROM users INNER JOIN needs USING (user_id) WHERE needs.need_id = $1',[need_id])
								])
							.spread( (have, need) => {
								let h = have.rows[0];
								let n = need.rows[0];
								return transactions.match(h.email,{have_name: h.name, need_name:n.name, thing:h.have });
							})
							.catch(err => console.log(err))
						);
	}

	static all() {
		return db.query(sql.select.matches.all)
						 .then( results => Q.all( results.rows.map( Matches.get_details )));
	}

	static get_details (match) {
		return Q.all([ 
				db.query(sql.select.needs.with_id, [match.need_id]), 
				db.query(sql.select.haves.with_id, [match.have_id]), 
				match
			]).spread((need,have,match) => {
				return { need:need.rows[0], 
								 have:have.rows[0],
								 match: match }; 
			});
	}

	static get(match_id) {
		return db.query(sql.select.matches.with_match_id,[match_id])
			.then( results => results.rows[0] )
			.then( Matches.get_details );
	}

	static conversation(match_id) {
		return db.query(sql.select.converstation.with_match_id, [match_id])
						 .then( results => {
							 return results.rows.map( e => {
								 e.time_ago_in_words = moment(e.date_added).fromNow();
								 return e;
							 });
						 });
	}
}

/*global exports:true */
exports = module.exports = Matches;