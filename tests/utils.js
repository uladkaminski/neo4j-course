const { readFileSync } = require('fs');
const { globSync } = require('glob');
const { sep, join } = require('path');

require('isomorphic-fetch');


const getAttribute = (asciidoc, attribute) => {
    const pattern = new RegExp(`:${attribute}: (.*)`)
    const match = asciidoc.match(pattern)

    return match ? match[1] : undefined
}

function globJoin() {
    return Array.from(arguments).join('/')
}

async function getStatusCode(url) {
    const res = await fetch(url)

    return res.status
}

function findLinks(asciidoc) {
    const output = []
    const matches = asciidoc.matchAll(/link:([^\[]*)\[((?:[^\]]*\^?)*)\]/g)

    for (const match of matches) {
        if (match[1].startsWith('http') && !match[1].includes('localhost')) {
            output.push(match[1])
        }
    }

    return output
}

function getActiveCoursePaths() {
    return globSync(globJoin(__dirname, '..', 'asciidoc', 'courses', '*'))
        .filter(path => {
            const slug = path.split(sep).reverse()[0]

            const courseAdoc = readFileSync(
                join(__dirname, '..', 'asciidoc', 'courses', slug, 'course.adoc')
            ).toString()

            return getAttribute(courseAdoc, 'status') === 'active' && getAttribute(courseAdoc, 'certification') !== 'true'
        })
        .map(path => path.split(sep).reverse()[0])
}


module.exports = {
    getAttribute,
    globJoin,
    getStatusCode,
    findLinks,
    getActiveCoursePaths,
}
