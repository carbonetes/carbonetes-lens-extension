# Carbonetes Lens Extension

This is a [Lens](https://k8slens.dev/) Extension for [Carbonetes](https://carbonetes.com/) provides the most comprehensive and complete Container Application Security Testing (CAST) solution on the market with best-in-class results. 

[![Screenshot](docs/images/example.png)](https://youtu.be/X-bhVwmp2l4)

## Prerequisites

* You need to have [node](https://nodejs.org/en/) and [npm](https://nodejs.org/en/) installed on your system. It is recommended to use the node version used for Lens development itself which is documented [here](https://github.com/lensapp/lens#development).
* [Install][lens-installation] Lens >= [4.0.3][min-lens].


## Install

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/carbonetes/carbonetes-lens-extension.git
ln -s $(pwd)/carbonetes-lens-extension ~/.k8slens/extensions/carbonetes-lens-extension
```

## Build

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd carbonetes-lens-extension
make build
```

OR

```sh
cd carbonetes-lens-extension
npm install
npm run build
```

## Getting Started

1. Open Lens application and select **Lens** menu, and then click **Extensions** item, or press <kbd>Shift</kbd> + <kbd>Command</kbd> + <kbd>E</kbd> to open the **Manage Lens Extensions** page.
2. You'll see the @aquasecurity/starboard-lens-extension extension listed under Installed Extensions. Click Enable to enable it.
![](docs/images/manage-extension.png)
3. Image
![](docs/images/manage.png)
4. Complete Analysis
![](docs/images/complete-analysis.png)
5. Policy Evaluation
![](docs/images/policy-evaluation.png)
6. Vulnerabilities
![](docs/images/vulnerabilities.png)

## Uninstall

```sh
rm ~/.k8slens/extensions/carbonetes-lens-extension
```

Restart Lens application.
