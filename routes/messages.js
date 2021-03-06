'use strict';
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var User = require('../models/user');
var Message = require('../models/message');

router.get('/', function (req, res, next) {
  Message.find()
    .populate('user', 'firstName')
    .exec(function (err, messages) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }
      res.status(200).json({
        message: 'Success',
        obj: messages
      });
    });
});

router.use('/', function (req, res, next) {
  jwt.verify(req.query.token, 'secret', function (err, decoded) {
    if (err) {
      console.log('ERRRRROR', err)
      return res.status(401).json({
        title: 'you are not signed in',
        error: {message: 'Login credentials must be provided'}
      });
    }
    next();
  });
});

router.post('/', function (req, res, next) {
  var decoded = jwt.decode(req.query.token);
  console.log('DECODED', decoded)
  User.findById(decoded.user._id, function (err, user) {
    if (err) {
      return res.status(500).json({
        title: 'An error occurred',
        error: err
      });
    }
    var message = new Message({
      content: req.body.content,
      user: user._id, 
      username: decoded.user.firstName
    });
    console.log('Double checking message', message)

    message.save(function (err, result) {
      let new_list = user.messages;
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }
      console.log('USERRRRR', user);
      console.log('RESULT', result);
      new_list.push(result);
      user.messages = new_list;
      user.save();
      
      res.status(201).json({
        message: 'Saved message',
        obj: result
      });
      
    });
  });
});

router.patch('/:id', function (req, res, next) {
  var decoded = jwt.decode(req.query.token);
  Message.findById(req.params.id, function (err, message) {
    if (err) {
      return res.status(500).json({
        title: 'An error occurred',
        error: err
      });
    }
    if (!message) {
      return res.status(500).json({
        title: 'No Message Found!',
        error: {message: 'Message not found'}
      });
    }
    if (message.user.toString() !== decoded.user._id) {
      return res.status(401).json({
        title: 'Not Authenticated',
        error: {message: 'Users do not match'}
      });
    }
    message.content = req.body.content;
    message.save(function (err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }
      res.status(200).json({
        message: 'Updated message',
        obj: result
      });
    });
  });
});

router.delete('/:id', function (req, res, next) {
    
  var decoded = jwt.decode(req.query.token);
  Message.findById(req.params.id, function (err, message) {
    if (err) {
      return res.status(500).json({
        title: 'An error occurred',
        error: err
      });
    }
    if (!message) {
      return res.status(500).json({
        title: 'No Message Found!',
        error: {message: 'Message not found'}
      });
    }
    console.log('MESSAGE', message);
    console.log('DECODED', decoded);
    if (message.user.toString() !== decoded.user._id) {
      return res.status(401).json({
        title: 'Not Authenticated',
        error: {message: 'Users do not match'}
      });
    }
    message.remove(function (err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }
      res.status(200).json({
        message: 'Deleted message',
        obj: result
      });
    });
  });
});

module.exports = router;