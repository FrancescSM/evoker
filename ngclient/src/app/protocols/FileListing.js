/* eslint-disable arrow-body-style */
export default function createMethods(session) {
  return {
    listServerDirectory: (path = '.') => {
      console.log('FileListing: ', path);
      return session.call('file.server.directory.list', [path]);
    },
  };
}
