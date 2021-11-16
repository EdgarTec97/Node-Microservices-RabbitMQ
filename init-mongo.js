db.getSiblingDB("staging").createUser({
  user: "root",
  pwd: "root",
  roles: [
    { role: "dbAdmin", db: "staging" },
    { role: "dbOwner", db: "staging" },
    { role: "userAdmin", db: "staging" },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});

db.getSiblingDB("challenge").createUser({
  user: "root",
  pwd: "root",
  roles: [
    { role: "dbAdmin", db: "challenge" },
    { role: "dbOwner", db: "challenge" },
    { role: "userAdmin", db: "challenge" },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});
