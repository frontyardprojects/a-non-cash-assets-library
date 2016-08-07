
/* jshint esnext:true, globalstrict:true */
/* global require, module, console, __dirname */

"use strict";

const express = require('express');

const models 	= require('../models/models.js');


/* global exports:true */
exports = module.exports = {
	render_template: render_template,
	handle_error: handle_error,
	is_logged_in: is_logged_in,
	attach_template_data:attach_template_data,
};


function render_template (template) {
	return (req,res) => res.render(template, req.data);
}

function handle_error (req, res, path) {
	return err => {
		if ( typeof err === 'string' ) {
			req.flash('error', err);
		} else {
			req.flash('error', err.message);
			console.log(err);
		}
		res.redirect(path);
	};
}

/* Middleware to append data to request object used in rendering dust templates */
function attach_template_data (req,res,next) {
	//setup defaults that will be passed to all rendered templates
	req.data = {
		title: 'Arts Assets Prototype',
		path: req.path,
		menu: [{ 
			name: 'About',
			link:'/about' 
		},{ 
			name: 'Listings',
			link:'/',
			}],
		user: req.user,
		message: req.flash('message'),
		error: req.flash('error') /* get error if raised on previous route */
	};
	next();
}

/** Simple middleware function to check if user is loged in before accessing restricted routes */
function is_logged_in(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}