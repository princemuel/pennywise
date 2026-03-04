#![warn(clippy::pedantic)]
#![warn(clippy::ptr_arg)]
#![warn(clippy::use_self)]
#![warn(clippy::suspicious)]
#![warn(clippy::perf)]

mod application;
mod config;
mod domain;
mod http;
mod infra;
mod shared;

pub mod bootstrap;
