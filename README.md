# claude-toolkit

A personal [Claude Code](https://code.claude.com) plugin marketplace.

## Quick start

```
/plugin marketplace add aksejs/claude-toolkit
/plugin install dynamic-workflows-toolkit@claude-toolkit
/reload-plugins
```

## Plugins

| Plugin | Description |
|--------|-------------|
| [**dynamic-workflows-toolkit**](plugins/dynamic-workflows-toolkit) | Author, lint, and ship Claude Code dynamic workflows. Skills: `writing-workflows`, `reviewing-workflows`. |

## Layout

```
.claude-plugin/marketplace.json    # the marketplace catalog
plugins/
  dynamic-workflows-toolkit/       # plugin
    .claude-plugin/plugin.json
    skills/
      writing-workflows/
      reviewing-workflows/
```

## License

[MIT](LICENSE)
