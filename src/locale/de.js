module.exports = {
  meta: {
    id: "de",
    name: "Deutsch",
    intl: require("react-intl/locale-data/de")
  },
  loading: "Lädt...",
  error: "Fehler",
  errorMessages: {
    generic: "Ein allgemeiner Fehler ist aufgetreten! Vielleicht finden Sie vage Details weiter unten!"
  },
  notifications: "Benachrichtigungen",
  noNotifications: "Keine Benachrichtigungen!",
  username: "Benutzername",
  password: "Passwort",
  save: "Speichern",
  none: "Keine",
  actions: "Aktionen",
  formValueRequired: "\"{field}\" muss angegeben werden!",
  // Navigation
  navigation: {
    home: "Startseite",
    admin: {
      menu: "Administration",
      account: "Benutzerkonto",
      newPost: "Neuer Post"
    }
  },
  // Strings used for displaying and editing posts
  post: {
    subtitle: "{author} am {date, date, medium}",
    edit: "Post bearbeiten",
    editor: {
      notification: {
        deleted: {
          title: "Post gelöscht.",
          description: "Der Post wurde gelöscht. Der Inhalt des Posts bleib im Editor erhalten, falls Sie Ihn erneut veröffentlichen möchten."
        },
        delete: {
          title: "Sind Sie sicher?",
          description: "Sie sind dabei diesen Post zu löschen. Diese Aktion ist permanent und kann nicht rückgängig gemacht werden.",
          confirm: "Verstanden - Trotzdem löschen"
        },
        published: {
          title: "Veröffentlicht!",
          description: "Der Post {link} wurde veröffentlicht."
        }
      }
    },
    title: {
      new: "Post verfassen...",
      edit: "Bearbeite {title}"
    },
    defaults: {
      title: "Neuer Post",
      description: "Damit Ihr indess erkennt, woher dieser ganze Irrthum gekommen ist, und weshalb man die Lust anklagt und den Schmerz lobet, so will ich Euch Alles eröffnen und auseinander setzen, was jener Begründer der Wahrheit und gleichsam Baumeister des glücklichen Lebens selbst darüber gesagt hat. Niemand, sagt er, verschmähe, oder hasse, oder fliehe die Lust als solche, sondern weil grosse Schmerzen ihr folgen, wenn man nicht mit Vernunft ihr nachzugehen verstehe."
    }
  },
  about: {
    title: "Über {id}...",
    permissions: "Berechtigungen:",
    recentPosts: "Neueste Posts"
  },
  account: {
    title: "Benutzerkonto",
    signIn: "Anmelden",
    signOut: "Abmelden",
    changePassword: {
      field1: "Passwort ändern",
      field2: "Passwort ändern (erneut eingeben)",
      field1Placeholder: "Ihr neues Passwort (optional)",
      field2Placeholder: "Ihr neues Passwort (optional)",
      mismatchError: "Beide Passwörter müssen übereinstimmen. Falls Sie Ihr Passwort nicht ändern möchten, lassen Sie beide Felder frei."
    },
    confirmPassword: {
      field: "Aktuelles Passwort",
      placeholder: "Geben Sie Ihr Passwort zum Bestätigen ein"
    },
    bio: {
      field: "Informationen über Sie",
      placeholder: "Der hier eingegebene Text ist auf Ihrer Profilseite für Besucher der Webseite sichtbar."
    },
    permissions: "Berechtigungen:",
    welcome: "Willkommen, {id}!",
    viewPublic: "Öffentliches Profil ansehen",
    updateProfile: "Benutzerprofil löschen",
    changeAvatar: "Avatar ändern",
    avatarTooLarge: "Der Avatar darf nicht größer als {maxSize} sein. (Gewählte Größe: {isSize})",
    delete: "Benutzerkonto löschen",
    usernamePlaceholder: "ihr-username",
    passwordPlaceholder: "Ihr Passwort",
    cookieRequired: "Der Cookie wird benötigt um Sie anzumelden.",
    acceptCookie: "Ich bin einverstanden, dass ein Cookie in meinem Browser gespeichert wird um mich einzuloggen."
  },
  pages: {
    blog: {
      title: "Blog"
    }
  }
}