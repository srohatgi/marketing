var colls = db.getCollectionNames();

print("# of collections: "+(colls.length-1));

for (var i=0; i<colls.length;i++) {
  if ( colls[i] != 'system.indexes' ) {
    print("dropping collection "+colls[i]+" with "+db[colls[i]].count()+" records");
    db[colls[i]].drop();
  }
}
