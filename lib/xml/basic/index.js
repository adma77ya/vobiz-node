/**
 * Basic XML Elements - Index
 * Exports all XML1 basic generators
 */

module.exports = {
  play: require('./play'),
  wait: require('./wait'),
  hangup: require('./hangup'),
  redirect: require('./redirect'),
  dtmf: require('./dtmf'),
  preanswer: require('./preanswer'),
  stream: require('./stream'),
  conference: require('./conference')
};
